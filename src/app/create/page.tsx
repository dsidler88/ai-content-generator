import CreateCourseForm from "@/components/CreateCourseForm";
import { getAuthSession } from "@/lib/auth";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

//server component, so should be async
const CreatePage = async (props: Props) => {
  //if user not logged in redirect to gallery
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }
  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Learning Journey
      </h1>
      <div className="flex p-4 mt-5 border-none bg-secondary">
        <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
        <div className="">
          Enter a title or what your test suite is named. Then enter a list of
          test steps, the specifics, and AI will generate a test suite for you
        </div>
      </div>

      {/* form component (client component) */}
      <CreateCourseForm />
    </div>
  );
};

export default CreatePage;
