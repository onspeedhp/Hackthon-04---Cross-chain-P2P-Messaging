import { NextApiRequest, NextApiResponse } from "next";

interface sqData {
  data: number[];
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      msg: "Invalid method",
    });
  }

  const body = req.body;
  console.log(body);

  return res.status(200).send("Finished");
}
