import axios from "axios";
import * as tunnel from "tunnel";

const agent = tunnel.httpsOverHttp({
  proxy: {
    host: "evapzen.fpl.com",
    port: 10262,
  },
});

export const getUnsplashImage = async (query: string) => {
  const { data } = await axios.get(
    `
  https://api.unsplash.com/search/photos?per_page=1&query=${query}&client_id=${process.env.UNSPLASH_API_KEY}
  `,
    {
      httpsAgent: agent,
      proxy: false,
    }
  );

  return data.results[0].urls.small_s3;
};
