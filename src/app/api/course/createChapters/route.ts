import { NextResponse } from "next/server";
import { createChaptersSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unsplash";
import { prisma } from "@/lib/db";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    //console.log(body);
    // Validate body with zod. if it validates, we're guaranteed to have a title and units in our request body
    const { title, units } = createChaptersSchema.parse(body);

    console.log("HERE ARE TITLE AND UNITS", title, units);

    //console.log(title);
    //console.log(units);
    type outputUnits = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];

    //output an array of units, each unit has an array of chapters. so we prompt for each unit, then for each chapter

    //guarantees that the output json will have title, etc
    // let output_units: outputUnits = await strict_output(
    //   "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter",
    //   new Array(units.length).fill(
    //     `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educationalvideo for each chapter. Each query should give an educational informative course in youtube.`
    //   ),
    //   {
    //     title: "title of the unit",
    //     chapters:
    //       "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
    //   }
    // );

    let output_units: outputUnits = await strict_output(
      "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter",
      units.map(
        (unit) =>
          `Create chapters for the unit '${unit}' in the course '${title}'. Each chapter should include a detailed youtube search query related to the topic of '${unit}'.`
      ),
      {
        title: "title of the unit",
        chapters:
          "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
      }
    );

    //get the image from unsplash
    //guarantees the shape, will return an object with a key image_search_term
    const imageSearchTerm = await strict_output(
      "you are an AI capable of finding the most relevant image for a course",
      `Please provide a good image search term for the title of a course about ${title}. This search term will be used on a robust image library, so make sure it is a good search term that will return good results`,
      {
        image_search_term: "a good search term for the title of the course",
      }
    );

    //console.log("IMAGE SEARCH TERM", imageSearchTerm);
    // console.log("Here is output units");
    // console.log(output_units);

    const course_image = await getUnsplashImage(
      imageSearchTerm.image_search_term
    );

    //interfacing with prisma to add the title from our response, and loop over units.
    const course = await prisma.course.create({
      data: {
        name: title,
        image: course_image,
      },
    });

    for (const unit of output_units) {
      const title = unit.title;
      const prismaUnit = await prisma.unit.create({
        data: {
          name: title,
          courseId: course.id,
        },
      });
      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          };
        }),
      });
    }

    //all we need to return is the course id, to redirect them to the page after creation
    return NextResponse.json({ course_id: course.id });
    //return NextResponse.json({ output_units, imageSearchTerm, course_image });
  } catch (error) {
    //check if it's a type error or a zod error
    if (error instanceof ZodError) {
      console.log("IT WAS A ZOD ERROR");
      return new NextResponse("invalid body", { status: 400 });
    }
    return new NextResponse("Internal server error SOMEWHERE ELSE " + error, {
      status: 500,
    });
  }
}
