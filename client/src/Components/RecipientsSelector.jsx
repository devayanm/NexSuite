import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/prop-types
const RecipientsSelector = ({ recipients, setRecipients }) => {
  const [userOptions, setUserOptions] = useState([]);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        // Fetch users
        const usersResponse = await fetch(`${apiUrl}/users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const usersData = await usersResponse.json();
        const userOptions = usersData.map((user) => ({
          value: user.email,
          label: `${user.name} (${user.email})`,
          type: "user",
        }));

        //fetch lists
        const listsResponse = await fetch(
          `${apiUrl}/contact-lists/all?adminId=${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const listsData = await listsResponse.json();
        const listOptions = listsData.map((list) => ({
          value: `list-${list._id}`,
          label: `List: ${list.listName}`,
          type: "list",
        }));
        // Combine all options and add "Select All" option
        const combinedOptions = [
          {
            value: "select-all",
            label: "Select All",
            isSelectAll: true,
          },
          ...userOptions,
          ...listOptions,
        ];

        setUserOptions(combinedOptions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleRecipientsChange = async (selectedOptions) => {
    const isSelectAll = selectedOptions?.some(
      (option) => option.value === "select-all"
    );

    // Use a map to avoid duplicates and preserve labels
    const emailMap = new Map(); // key: email, value: label

    const addEmail = (email, label) => {
      if (!email || email === "select-all") return;
      if (!emailMap.has(email)) emailMap.set(email, label || email);
    };

    if (isSelectAll) {
      // Add all user emails only
      userOptions
        .filter((opt) => opt.type === "user")
        .forEach((opt) => addEmail(opt.value, opt.label));
    } else if (selectedOptions && selectedOptions.length) {
      // Process each selection
      for (const option of selectedOptions) {
        if (option.type === "list") {
          // Fetch users in the selected list
          try {
            const listId = option.value.split("-")[1];
            const response = await fetch(
              `${
                import.meta.env.VITE_API_URL
              }/contact-lists/view?listId=${listId}&adminId=${user}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
              }
            );
            const data = await response.json();
            const listUsers = (data.contacts || []).map((u) => ({
              value: u.email,
              label: `${u.name} (${u.email})`,
            }));
            listUsers.forEach((u) => addEmail(u.value, u.label));
          } catch (error) {
            console.error(
              `Failed to fetch users for list: ${option.label}`,
              error
            );
          }
        } else {
          // Treat as a direct email selection (user or custom entry)
          addEmail(option.value, option.label);
        }
      }
    }

    const updatedRecipients = Array.from(emailMap.entries()).map(
      ([value, label]) => ({ value, label })
    );

    setRecipients(updatedRecipients);
  };

  const handleCreateOption = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    if (!recipients.some((recipient) => recipient.value === inputValue)) {
      setRecipients([...recipients, newOption]);
    }
  };

  return (
    <div className="mb-4 mt-10">
      <label className="text-lg font-medium text-gradient mb-1 block">
        Recipients:
      </label>
      <Creatable
        isMulti
        options={userOptions}
        value={recipients}
        onChange={handleRecipientsChange}
        onCreateOption={handleCreateOption}
        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
        placeholder="Select or type emails"
        isClearable
        isSearchable
        noOptionsMessage={() => "No users or lists found"}
        className="basic-single text-xs inline mt-10"
        classNamePrefix="select"
      />
    </div>
  );
};

export default RecipientsSelector;
