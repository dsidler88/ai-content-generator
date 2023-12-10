//searches youtuibe

import axios from "axios";
import * as tunnel from "tunnel";
//import { YoutubeTranscript } from "youtube-transcript";
import { YoutubeTranscript } from "./youtubeTranscriptRecieverAxios";
import { strict_output } from "./gpt";

const agent = tunnel.httpsOverHttp({
  proxy: {
    host: "evapzen.fpl.com",
    port: 10262,
  },
});

export async function searchYoutube(searchQuery: string) {
  //makes strings with spaces uri friendly
  searchQuery = encodeURIComponent(searchQuery);

  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`,
    {
      httpsAgent: agent,
      proxy: false,
    }
  );
  // console.log("YOUTUBE AXIOS CALL SUCCESSFUL", data);
  if (!data) {
    console.log("fail");
    return null;
  }

  if (data.items[0] == undefined) {
    console.log("youtube fail");
    return null;
  }
  console.log("videoId", data.items[0].id.videoId);
  return data.items[0].id.videoId;
}

//this might be more trouble than it's worth. Think about alternates to youtube transcripts.
export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "US",
    });

    let transcript = "";

    for (let t of transcript_arr) {
      transcript += t.text + " ";
    }
    //replace newlines with spaces
    //console.log(transcript);
    return transcript.replaceAll("\n", " ");
  } catch (error) {
    return "error retrieving transcript: " + error;
  }
}

//returns 5 objects with question, answer, option1, option2, option3
export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  type Question = {
    question: string;
    answer: string;
    option1: string;
    option2: string;
    option3: string;
  };
  //get questions from transcript
  const questions: Question[] = await strict_output(
    "You are a helpful AI that is able to generate multiple choice questions and answers from a transcript. The length of each answer should not be more than 15 words",
    new Array(5).fill(
      `generate a random intermediate mcq question about ${course_title} with context of the following transcript: ${transcript}`
    ),
    {
      question: "question",
      answer: "answer (15 word maximum)",
      option1: "option1 (15 word maximum)",
      option2: "option2 (15 word maximum)",
      option3: "option3 (15 word maximum)",
    }
  );
  return questions;
}
