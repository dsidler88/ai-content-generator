"use client";
import { Chapter, Course, Unit } from "@prisma/client";
import React from "react";
import ChapterCard, { ChapterCardHandler } from "./ChapterCard";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

//need access to the course and all units
//this will take the course we jsut recieved and join it with the units and chapters from prisma
type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

//loop trhrough each unit and display the chapters
//need a
const ConfirmChapters = ({ course }: Props) => {
  const [loading, setLoading] = React.useState(false);
  //an array of refs, pointing to each component. Then u can call a function on the ref, to make the openai query for the chapter
  //each individual ref will have the triggerLoad function. That way we directly call methods on the child component from the parent
  const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
  //create a ref for each chapter, and pass it to the chapter card

  course.units.forEach((unit) => {
    unit.chapters.forEach((chapter) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      chapterRefs[chapter.id] = React.useRef(null);
    });
  });

  //completed chapters is a set of strings. in a set only unique values are allowed. So we can add a chapter id to the set, and it will only be added once
  //when any of the chapters come back with success:false, we add it to this set
  const [completedChapters, setCompletedChapters] = React.useState<Set<String>>(
    new Set()
  );

  //for each unit, add chapters to the accumulator. then return the accumulator
  const totalChaptersCount = React.useMemo(() => {
    return course.units.reduce((acc, unit) => {
      return acc + unit.chapters.length;
    }, 0);
  }, [course.units]);

  return (
    <div className="w-full mt-4">
      {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className="mt-5">
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Unit {unitIndex + 1}
            </h2>
            <h3 className="text-2xl font-bold">{unit.name}</h3>
            <div className="mt-3">
              {unit.chapters.map((chapter, chapterIndex) => {
                return (
                  //Here is where react.forwardref comes in. We can't pass a ref to a custom component without it
                  <ChapterCard
                    completedChapters={completedChapters}
                    setCompletedChapters={setCompletedChapters}
                    ref={chapterRefs[chapter.id]}
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center mt-4">
        <Separator className="flex-[1]" />
        <div className="flex items-center mx-4">
          <Link
            href="/create"
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={4} />
            Back
          </Link>

          {/* once all chapters are finished processing, this is true and complete */}
          {totalChaptersCount === completedChapters.size ? (
            <Link
              className={buttonVariants({
                className: "ml-4 font-semibold",
              })}
              href={`/course/${course.id}/0/0`}
            >
              Save and Continue
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={4} />
            </Link>
          ) : (
            <Button
              type="button"
              className="ml-4 font-semibold"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                //loop thru chapterRefs
                Object.values(chapterRefs).forEach((ref) => {
                  //if the ref exists, call the triggerLoad function on it
                  ref.current?.triggerLoad();
                });
              }}
            >
              Generate
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={4} />
            </Button>
          )}
        </div>
        <Separator className="flex-[1]" />
      </div>
    </div>
  );
};

export default ConfirmChapters;

//binding the triggerload function to each component, then when we press generate we loop thru each ref of the component and calling the internal triggerload function.
