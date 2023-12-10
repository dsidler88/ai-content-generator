import ConfirmChapters from "@/components/ConfirmChapters";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Info } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

//we know the courseId, it's in the Url.
//name here must match name in the slug file
type Props = {
  params: {
    courseId: string;
  };
};

//when you hit this page, the units and chapters have been generated, but need to get the content by querying youtube
const CreateChapters = async ({ params: { courseId } }: Props) => {
  //check login
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("gallery");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    //include is like a JOIN, it...
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  });

  if (!course) {
    return redirect("/create");
  }
  return (
    <div className="flex flex-col items-xtart max-w-xl mx-auto my-16">
      <h5 className="text-sm uppercase text-secondary-foreground/60">
        Course Name
      </h5>
      <h1 className="text-5xl font-bold">{course.name}</h1>

      <div className="flex p-4 mt-5 border-none bg-secondary">
        <Info className="w-12 h-12 mr-3 text-blue-400" />
        <div className="">
          I generated chapters for each of your Units. Review them and click the
          button to confirm and continue
        </div>
      </div>
      <ConfirmChapters course={course} />
    </div>
  );
};

export default CreateChapters;
