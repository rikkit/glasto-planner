import React, { useState } from "react";

interface Props {
  addUser: (code: string) => void;
  className?: string;
}

export const AddFriend = (props: Props) => {
  const [friendCode, setFriendCode] = useState<string>();

  return (
    <div className={`field field-add-friend ${props.className || ""}`}>
      <label>Add a friend</label>
      <div className="field-add-friend__inputs">
        <input
          placeholder="Code"
          value={friendCode}
          onChange={e => setFriendCode(e.currentTarget.value)}
        />

        <button
          type="button"
          disabled={!friendCode}
          onClick={() => props.addUser(friendCode!)}
        >
          Add
          </button>
      </div>
    </div>
  );
}
