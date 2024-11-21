import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { Spin, Input } from "antd";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;

const PptxViewer: React.FC = () => {
  const pptUrl =
    "https://dev-nts2024-truthaid-s3.truth-ai.com.cn/public/test.pptx";
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [slideContents, setSlideContents] = useState<string[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [backgroundStyles, setBackgroundStyles] = useState<string[]>([]);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPPTXFile = async () => {
      try {
        const response = await fetch(pptUrl);
        const arrayBuffer = await response.arrayBuffer();
        await processPPTXFile(arrayBuffer);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching PPTX file:", error);
        alert("获取 PPTX 文件时出错");
        setIsLoading(false);
      }
    };

    fetchPPTXFile();
  }, [pptUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        setSelectedSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (event.key === "ArrowDown") {
        setSelectedSlideIndex((prevIndex) =>
          Math.min(prevIndex + 1, slideContents.length - 1)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slideContents]);

  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const selectedThumbnail =
        thumbnailContainerRef.current.children[selectedSlideIndex];
      if (selectedThumbnail) {
        selectedThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedSlideIndex]);

  const getResourcePath = async (
    zip: JSZip,
    fileName: string,
    embed: string
  ) => {
    try {
      const relFile = `ppt/slides/_rels/${fileName.split("/").pop()}.rels`;
      if (!zip.files[relFile]) {
        console.error(`Missing .rels file for ${fileName}`);
        return null;
      }

      const relXml = await zip.files[relFile].async("string");
      const parser = new DOMParser();
      const relDoc = parser.parseFromString(relXml, "application/xml");
      const target = relDoc
        .querySelector(`Relationship[Id="${embed}"]`)
        ?.getAttribute("Target");

      if (!target) {
        console.error(`Missing target for embed ${embed}`);
        return null;
      }

      return `ppt/${target.replace("..", "")}`;
    } catch (error) {
      console.error(`Error getting resource path for ${embed}:`, error);
      return null;
    }
  };

  const processPPTXFile = async (arrayBuffer: ArrayBuffer) => {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.startsWith("ppt/slides/slide")
      );

      const slidePromises = slideFiles.map(async (fileName) => {
        if (!zip.files[fileName]) {
          console.error(`Missing slide file: ${fileName}`);
          return {
            slideImage: "",
            elements: "",
            backgroundColor: "",
            backgroundImage: "",
          };
        }

        const slideXml = await zip.files[fileName].async("string");
        const parser = new DOMParser();
        const slideDoc = parser.parseFromString(slideXml, "application/xml");

        // Extract text elements
        const elements: string[] = [];
        const spElements = slideDoc.getElementsByTagName("p:sp");
        for (let sp of spElements) {
          const tElements = sp.getElementsByTagName("a:t");
          for (let t of tElements) {
            elements.push(t.textContent || "");
          }
        }

        // Extract background color
        const bgElement = slideDoc.getElementsByTagName("p:bg")[0];
        let backgroundColor = "#FFFFFF";
        if (bgElement) {
          const solidFill = bgElement.getElementsByTagName("a:solidFill")[0];
          if (solidFill) {
            const srgbClr = solidFill.getElementsByTagName("a:srgbClr")[0];
            if (srgbClr) {
              backgroundColor = `#${srgbClr.getAttribute("val") || "FFFFFF"}`;
            }
          }
        }

        // Extract background image
        let backgroundImage = "";
        const blipFill = bgElement?.getElementsByTagName("p:blipFill")[0];
        if (blipFill) {
          const blip = blipFill.getElementsByTagName("a:blip")[0];
          const embed = blip?.getAttribute("r:embed");
          if (embed) {
            const imagePath = await getResourcePath(zip, fileName, embed);
            if (imagePath) {
              const imageData = await zip.files[imagePath].async("base64");
              backgroundImage = `data:image/png;base64,${imageData}`;
            }
          }
        }

        // Render slide as image
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          // Set canvas size based on slide layout
          canvas.width = 960; // Example width
          canvas.height = 540; // Example height

          // Fill background color
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Draw background image if available
          if (backgroundImage) {
            const img = new Image();
            img.src = backgroundImage;
            await new Promise((resolve) => {
              img.onload = () => {
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(null);
              };
            });
          }

          // Draw text elements (simplified)
          context.fillStyle = "black";
          context.font = "20px Arial";
          elements.forEach((text, index) => {
            context.fillText(text, 50, 50 + index * 30);
          });

          // Convert canvas to image
          const slideImage = canvas.toDataURL("image/png");

          return {
            slideImage,
            elements: elements.join("\n"),
            backgroundColor,
            backgroundImage,
          };
        }

        return null;
      });

      const contents = await Promise.all(slidePromises);

      // Use contents to update your UI
      setSlideImages(contents.map((content) => content?.slideImage || ""));
      setSlideContents(contents.map((content) => content?.elements || ""));
      setBackgroundStyles(
        contents.map((content) => content?.backgroundColor || "")
      );
      setBackgroundImages(
        contents.map((content) => content?.backgroundImage || "")
      );
    } catch (error) {
      console.error("Error processing PPTX file:", error);
      alert("处理 PPTX 文件时出错");
    }
  };

  const handleContentChange = (index: number, value: string) => {
    setSlideContents((prevContents) => {
      const newContents = [...prevContents];
      newContents[index] = value;
      return newContents;
    });
  };

  return (
    <div>
      <h1>PPTX 文件预览</h1>
      <Spin spinning={isLoading} tip='加载中...'>
        <div style={{ display: "flex", marginTop: "20px" }}>
          <div
            ref={thumbnailContainerRef}
            style={{
              width: "180px",
              borderRight: "1px solid black",
              overflowY: "auto",
              maxHeight: "80vh",
            }}
          >
            {slideImages.map((slideImage, index) => (
              <div
                key={index}
                onClick={() => setSelectedSlideIndex(index)}
                style={{
                  margin: "10px 10px 0 0",
                  cursor: "pointer",
                  border:
                    selectedSlideIndex === index
                      ? "1px solid #4725f0"
                      : "1px solid #ddd",
                }}
              >
                <span>Slide {index + 1}</span>
                <img
                  src={slideImage}
                  alt={`Slide ${index + 1}`}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 0.5, marginBottom: "20px" }}>
              <img
                src={slideImages[selectedSlideIndex]}
                alt={`Slide ${selectedSlideIndex + 1}`}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <div
              style={{
                flex: 0.5,
                backgroundColor: backgroundStyles[selectedSlideIndex],
                backgroundImage: `url(${backgroundImages[selectedSlideIndex]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <h3>讲稿</h3>
              <TextArea
                value={slideContents[selectedSlideIndex]}
                onChange={(e) =>
                  handleContentChange(selectedSlideIndex, e.target.value)
                }
                autoSize={{ minRows: 13, maxRows: 13 }}
                style={{ width: "100%", marginBottom: "10px" }}
              />
              {/* <ReactMarkdown>{slideContents[selectedSlideIndex]}</ReactMarkdown> */}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default PptxViewer;
