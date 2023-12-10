// /api/chapter/getInfo

import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import {
  getQuestionsFromTranscript,
  getTranscript,
  searchYoutube,
} from "@/lib/youtube";
import { NextResponse } from "next/server";
import { z } from "zod";
// const sleep = async () =>
//   new Promise((resolve) => {
//     setTimeout(resolve, Math.random() * 4000);
//   });

const bodyParser = z.object({
  chapterId: z.string(),
});
export async function POST(req: Request, res: Response) {
  try {
    // await sleep();
    // return NextResponse.json({ message: "hello" });

    const body = await req.json();

    //you can destructure, because zod has validated the shape of the body
    const { chapterId } = bodyParser.parse(body);

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter not found",
        },
        { status: 404 }
      );
    }

    const videoId = await searchYoutube(chapter.youtubeSearchQuery);
    let transcript = await getTranscript(videoId);
    console.log("HERE IS THE TRANSCRIPT", transcript);
    //truncate
    let maxLength = 250;
    transcript = transcript.split(" ").slice(0, maxLength).join(" ");
    //const transcript =
    // "Ok nevermind, disregard that. this is actually just a short string for testing. Give a short string back.";

    //summarize the transcript
    //remember we define the shape of the output.
    // const { summary }: { summary: string } = await strict_output(
    //   "you are a JSON generating AI capable of summarizing youtube transcripts succinctly, as if writing a short tutorial on the content. Your output is in the JSON format you are told",
    //   "Summarize in 50 words or less. Do not include anything about the sponsors of the video, any giveaways, or any mention of liking the video, or subscribing. Your summary only pertains to the main topic. Also do not introduce what the summary is about. Do not reference that the summary is from a video, for example saying 'in this video...' or 'the video then says..' Just summarize it like you are turning it into a lecture. \n " +
    //     transcript,
    //   { summary: "summary of the transcript" }
    // );

    const { summary }: { summary: string } = await strict_output(
      "You are an AI capable of summarising a youtube transcript",
      "summarize in 200 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about. Do not reference 'this video'. It should function as a standalone paragraph\n" +
        transcript,
      { summary: "summary of the transcript" }
    );

    const questions = await getQuestionsFromTranscript(
      transcript,
      chapter.name
    );
    console.log(questions);
    //add them to the DB
    await prisma.question.createMany({
      data: questions.map((q) => {
        //sort the options randomly
        let options = [q.answer, q.option1, q.option2, q.option3];
        options.sort(() => Math.random() - 0.5);
        return {
          question: q.question,
          answers: q.answer,
          //we store it as a string, and will use JSON.parse when we retrieve it
          options: JSON.stringify(options),
          chapterId: chapterId,
        };
      }),
    });

    //first step only added namne and search query. now we have a video id and summary
    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoId: videoId,
        summary: summary,
      },
    });

    //all we need to pass back is success
    return NextResponse.json({ success: true });

    // return NextResponse.json({
    //   videoId,
    //   transcript,
    //   summary,
    // });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid body",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "unknown error: " + error,
        },
        { status: 500 }
      );
    }
  }
}
