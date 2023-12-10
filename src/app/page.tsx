"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const response = await fetch("/api/course/createChapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "ReactJS",
          units: ["Javascript", "Typescript"],
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2)); // Update the state with the formatted response data
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
        setApiResponse(`Error: ${error.message}`); // Update the state with the error message
      } else {
        // Handle cases where the caught object is not an Error instance
        console.error("An unexpected error occurred");
        setApiResponse("An unexpected error occurred");
      }
    }
  };

  return (
    <div>
      <Button onClick={handleClick}>Hello TEST FACTORY</Button>
      {apiResponse && <div>{apiResponse}</div>}
    </div>
  );
}
