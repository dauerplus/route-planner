export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { url } = req.body;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({ message: "Google API Error", details: data });
    }

    const optimizedOrder =
      data.routes[0]?.waypoint_order || data.routes[0]?.legs.map((_, i) => i) || [];

    res.status(200).json({ optimizedOrder });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
