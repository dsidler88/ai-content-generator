"use client";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapters: Set<String>;
  setCompletedChapters: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

//because we want to pass in a ref from another component, we need to use forwardRef
//the ref takes in the HANDLER, and the PROPS, as a generic
//we had { chapter, chapterIndex }: Props, but don't need the type because we are passing it in as a generic. also added ref
//the two generics relate to the props and the handler
const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(
  ({ chapter, chapterIndex, completedChapters, setCompletedChapters }, ref) => {
    const { toast } = useToast();
    //this is the handler that we will pass to the parent component
    //define triggerLoad and bind it to the ref
    //useImperativeHandle is a hook that exposes functions to the parent component via the ref

    //later on will add this success state
    const [success, setSuccess] = React.useState<boolean | null>(null);

    //will asynchronously make this call for every chapter
    const { mutate: getChapterInfo, isLoading } = useMutation({
      mutationFn: async () => {
        const response = await axios.post("/api/chapter/getInfo", {
          chapterId: chapter.id,
        });
        // if (response.data.success)
        //console.log(response.data);
        return response.data;
      },
    });
    //this call back will memoize the function so we don't recreate it each time we rerender
    //but it will run if the chapter.id changes, adding the new chapter to the set
    //The memoization ensures that the function isn't recreated on every render unless one of its dependencies has changed.
    const addChapterIdToSet = React.useCallback(() => {
      setCompletedChapters((prev) => {
        const newSet = new Set(prev);
        newSet.add(chapter.id);
        return newSet;
      });
    }, [chapter.id, setCompletedChapters]);

    //check if video.id already exists. if so it has already been processed
    React.useEffect(() => {
      if (chapter.videoId) {
        setSuccess(true);
        addChapterIdToSet();
      }
    }, [chapter, addChapterIdToSet]);

    React.useImperativeHandle(ref, () => ({
      async triggerLoad() {
        //don't redo the query if we already have the info
        if (chapter.videoId) {
          //early return if it's already been loaded
          addChapterIdToSet();
          return;
        }
        getChapterInfo(undefined, {
          //part of the useMutation hook. callback function that will be called when the mutation is successful
          onSuccess: () => {
            //set the success state to true
            setSuccess(true);
            addChapterIdToSet();
          },
          onError: (error) => {
            console.log(error);
            setSuccess(false);
            toast({
              title: "Error",
              description: "Error loading chapters in red",
              variant: "destructive",
            });
            addChapterIdToSet();
          },
        });
      },
    }));

    return (
      <div
        key={chapter.id}
        className={cn("px-y py-2 mt-2 rounded flex justify-between", {
          "bg-secondary": success === null,
          "bg-red-500": success === false,
          "bg-green-500": success === true,
        })}
      >
        <h5 className="px-2">
          Chapter {chapterIndex + 1}: {chapter.name}
        </h5>
        {isLoading && <Loader2 className="animate-spin" />}
      </div>
    );
  }
);

//do we need this? see what it does
ChapterCard.displayName = "ChapterCard";

export default ChapterCard;

//final summary
//So we pass the array of refs from ConfirmChapters, also the array of chapters to make cards.
//for each one of these refs, we assign a "triggerLoad" function to it, which will be called by the parent component
//we create the refs and associate them in the parent component with const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
//watch vids on refs and forwardrefs
