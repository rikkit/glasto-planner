import React, { useState } from "react";

interface Props {
  addUser: (name: string, code: string) => void;
}

export const Share = (props: Props) => {
  const [friendName, setFriendName] = useState<string>();
  const [friendCode, setFriendCode] = useState<string>();

  return (
    <div>
      <div className="field field-add-friend">
        <label>Add a friend</label>
        <div className="field-add-friend__inputs">
          <input
            placeholder="Name"
            value={friendName}
            onChange={e => setFriendName(e.currentTarget.value)}
          />
          <input
            placeholder="Code"
            value={friendCode}
            onChange={e => setFriendCode(e.currentTarget.value)}
          />
        </div>
        
        <button
          disabled={!friendName || !friendCode}
          onClick={() => props.addUser(friendName!, friendCode!)}
        >
          Add
        </button>
      </div>
    </div>
  );
}
