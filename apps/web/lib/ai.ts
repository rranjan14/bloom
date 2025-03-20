export async function generateContentWithAI(prompt: string, system: string = `You are an expert essay writer and content creator with extensive experience in various topics. 
Always structure your response using proper semantic HTML. You can use any valid HTML tags that best represent the content structure and meaning, including but not limited to:
- Headings (<h1> through <h6>) for document structure
- Text content tags (<p>, <pre>, <blockquote>)
- Lists (<ul>, <ol>, <li>, <dl>, <dt>, <dd>)
- Text semantics (<strong>, <em>, <mark>, <cite>, <code>, <time>, <abbr>)
- Links and references (<a>, <sup>, <sub>)
- Code blocks (<code>, <pre>)

You only need to return necessary tags and do not need to return complete HTML document. Word count should never exceed 150`): Promise<string> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        system,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate content")
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error("Error generating content with AI:", error)
    throw new Error("Failed to generate content")
  }
}


const BLOG_TOPICS = [
  "The Future of Artificial Intelligence",
  "Blockchain Technology Trends",
  "Cybersecurity Best Practices",
  "Cloud Computing Evolution",
  "Machine Learning Applications",
  "DevOps Culture and Practices",
  "Sustainable Technology",
  "5G and IoT Revolution"
];

export async function generateRandomBlog(): Promise<{
  title: string;
  content: string;
}> {
  const randomTopic = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];
  const prompt = `Write a comprehensive blog post about "${randomTopic}". Include an introduction, main points, and a conclusion. There should be no more than 150 words`;
  
  const content = await generateContentWithAI(prompt);
  return {
    title: randomTopic,
    content
  };
}

export async function generateMultipleBlogs(count: number = 5): Promise<Array<{
  title: string;
  content: string;
}>> {
  const blogs = [];
  for (let i = 0; i < count; i++) {
    const blog = await generateRandomBlog();
    blogs.push(blog);
  }
  return blogs;
}

