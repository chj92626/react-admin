import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { Spin, Input } from "antd";
import EmptyPPTIcon from "@/assets/empty-ppt.svg";
import { LoadingOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const PptxViewer: React.FC = () => {
  const pptUrl = "https://dev-nts2024-truthaid-s3.truth-ai.com.cn/public/test.pptx";
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [slideContents, setSlideContents] = useState<any[]>([]);
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
        console.error("获取 PPTX 文件时出错:", error);
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

  // 获取资源路径
  const getResourcePath = async (
    zip: JSZip,
    fileName: string,
    embed: string
  ) => {
    try {
      const relFile = `ppt/slides/_rels/${fileName.split("/").pop()}.rels`;
      if (!zip.files[relFile]) {
        console.error(`缺少 .rels 文件: ${fileName}`);
        return null;
      }

      const relXml = await zip.files[relFile].async("string");
      const parser = new DOMParser();
      const relDoc = parser.parseFromString(relXml, "application/xml");
      const target = relDoc
        .querySelector(`Relationship[Id="${embed}"]`)
        ?.getAttribute("Target");

      if (!target) {
        console.error(`缺少目标: ${embed}`);
        return null;
      }

      return `ppt/${target.replace("..", "")}`;
    } catch (error) {
      console.error(`获取资源路径时出错: ${embed}`, error);
      return null;
    }
  };

  // 处理 PPTX 文件
  const processPPTXFile = async (arrayBuffer: ArrayBuffer) => {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.startsWith("ppt/slides/slide")
      );

      const slidePromises = slideFiles.map(async (fileName) => {
        if (!zip.files[fileName]) {
          console.error(`缺少幻灯片文件: ${fileName}`);
          return {
            slideImage: "",
            elements: [],
            backgroundColor: "",
            backgroundImage: "",
          };
        }

        const slideXml = await zip.files[fileName].async("string");
        const parser = new DOMParser();
        const slideDoc = parser.parseFromString(slideXml, "application/xml");

        // 提取文本元素和样式
        const elements = [];
        const spElements = slideDoc.getElementsByTagName("p:sp");
console.log('slideDoc',slideDoc);

        for (let sp of spElements) {
          const tElements = sp.getElementsByTagName("a:t");
          const rPrElements = sp.getElementsByTagName("a:rPr");

          for (let i = 0; i < tElements.length; i++) {
            const text = tElements[i].textContent || "";
            const rPr = rPrElements[i];

            let fontSize = "20px";
            let color = "#000000";
            let typeface = "Arial";

            if (rPr) {
              const sz = rPr.getAttribute("sz");
              if (sz) {
                fontSize = `${parseInt(sz, 10) / 100}pt`;
              }

              const solidFill = rPr.getElementsByTagName("a:solidFill")[0];
              if (solidFill) {
                const srgbClr = solidFill.getElementsByTagName("a:srgbClr")[0];
                if (srgbClr) {
                  color = `#${srgbClr.getAttribute("val")}`;
                }
              }

              const latin = rPr.getElementsByTagName("a:latin")[0];
              if (latin) {
                typeface = latin.getAttribute("typeface") || "Arial";
              }
            }

            elements.push({ text, fontSize, color, typeface });
          }
        }

        // 提取背景颜色
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

        // 提取背景图片
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

        // 将幻灯片渲染为图片
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          // 根据幻灯片布局设置画布大小
          canvas.width = 960; // 示例宽度
          canvas.height = 540; // 示例高度

          // 填充背景颜色
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);

          // 如果有背景图片，绘制背景图片
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
          // console.log('elements',elements);
          

          // 绘制带样式的文本元素
          elements.forEach(({ text, fontSize, color, typeface }, index) => {
            context.fillStyle = color;
            context.font = `${fontSize} ${typeface}`;
            context.fillText(text, 50, 50 + index * 30);
          });

          // 将画布转换为图片
          const slideImage = canvas.toDataURL("image/png");

          return {
            slideImage,
            elements: elements.map(e => e.text).join("\n"),
            backgroundColor,
            backgroundImage,
          };
        }

        return null;
      });

      const contents = await Promise.all(slidePromises);

      // 使用内容更新 UI
      setSlideImages(contents.map((content) => content?.slideImage || ""));
      setSlideContents(contents.map((content) => content?.elements || ""));
      // console.log('slideContents',slideContents);
      
      setBackgroundStyles(
        contents.map((content) => content?.backgroundColor || "")
      );
      setBackgroundImages(
        contents.map((content) => content?.backgroundImage || "")
      );
    } catch (error) {
      console.error("处理 PPTX 文件时出错:", error);
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
      <div style={{ display: "flex", marginTop: "20px" }}>
        <div
          ref={thumbnailContainerRef}
          style={{
            width: "190px",
            borderRight: "1px solid black",
            overflowY: "auto",
            maxHeight: "80vh",
          }}
        >
          {slideImages.map((slideImage, index) => (
            <div style={{ display: "flex" }} key={index}>
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
                <img
                  src={slideImage}
                  alt={`幻灯片 ${index + 1}`}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
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
            <Spin
              spinning={isLoading}
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            >
              <img
                src={slideImages[selectedSlideIndex] || EmptyPPTIcon}
                alt={`幻灯片 ${selectedSlideIndex + 1}`}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Spin>
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
            <Spin spinning={isLoading} tip='加载中...'>
              <TextArea
                value={slideContents[selectedSlideIndex]}
                onChange={(e) =>
                  handleContentChange(selectedSlideIndex, e.target.value)
                }
                autoSize={{ minRows: 13, maxRows: 13 }}
                style={{ width: "100%", marginBottom: "10px" }}
              />
            </Spin>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PptxViewer;
