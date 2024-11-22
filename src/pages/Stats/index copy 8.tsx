// 文本内容换行
import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { Spin, Input } from "antd";
import EmptyPPTIcon from "@/assets/empty-ppt.svg";
import { LoadingOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const PptxViewer: React.FC = () => {
  const pptUrl =
    "https://dev-nts2024-truthaid-s3.truth-ai.com.cn/public/test.pptx";
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [slideContents, setSlideContents] = useState<any[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [backgroundStyles, setBackgroundStyles] = useState<string[]>([]);
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

  const getResourcePath = async (
    zip: JSZip,
    fileName: string,
    embed: string
  ) => {
    try {
      const relFile = `ppt/slides/_rels/${fileName.split("/").pop()}.rels`;
      if (!zip.files[relFile]) {
        console.error(`缺少 .rels 文件: ${relFile}`);
        return null;
      }

      const relXml = await zip.files[relFile].async("string");
      const parser = new DOMParser();
      const relDoc = parser.parseFromString(relXml, "application/xml");
      let target = relDoc
        .querySelector(`Relationship[Id="${embed}"]`)
        ?.getAttribute("Target");

      if (!target) {
        console.error(`缺少目标: ${embed}`);
        return null;
      }

      target = target.replace(/^\.\.\//, "").replace(/\/+/g, "/");

      const fullPath = `ppt/${target}`;
      if (!zip.files[fullPath]) {
        console.error(`缺少图像文件: ${fullPath}`);
        return null;
      }

      return fullPath;
    } catch (error) {
      console.error(`获取资源路径时出错: ${embed}`, error);
      return null;
    }
  };

  const processPPTXFile = async (arrayBuffer: ArrayBuffer) => {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);

      // 提取幻灯片尺寸
      const presentationXml = await zip.files["ppt/presentation.xml"].async(
        "string"
      );
      const parser = new DOMParser();
      const presentationDoc = parser.parseFromString(
        presentationXml,
        "application/xml"
      );

      const sldSz = presentationDoc.getElementsByTagName("p:sldSz")[0];
      const slideWidth = parseInt(sldSz.getAttribute("cx"), 10);
      const slideHeight = parseInt(sldSz.getAttribute("cy"), 10);

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
          };
        }

        const slideXml = await zip.files[fileName].async("string");
        const slideDoc = parser.parseFromString(slideXml, "application/xml");

        const elements = [];
        const spElements = slideDoc.getElementsByTagName("p:sp");
        const picElements = slideDoc.getElementsByTagName("p:pic");

        for (let sp of spElements) {
          const spPr = sp.getElementsByTagName("p:spPr")[0];
          const xfrm = spPr?.getElementsByTagName("a:xfrm")[0];
          const off = xfrm?.getElementsByTagName("a:off")[0];
          const ext = xfrm?.getElementsByTagName("a:ext")[0];
          const rot = xfrm?.getAttribute("rot");

          let x = 0,
            y = 0,
            width = 0,
            height = 0,
            rotation = 0;
          if (off) {
            x = parseInt(off.getAttribute("x"), 10) / 12700;
            y = parseInt(off.getAttribute("y"), 10) / 12700;
          }
          if (ext) {
            width = parseInt(ext.getAttribute("cx"), 10) / 12700;
            height = parseInt(ext.getAttribute("cy"), 10) / 12700;
          }
          if (rot) {
            rotation = parseInt(rot, 10) / 60000; // 旋转角度
          }

          // 填充
          const solidFill = spPr?.getElementsByTagName("a:solidFill")[0];
          let fillColor = "#00000000";
          if (solidFill) {
            const srgbClr = solidFill.getElementsByTagName("a:srgbClr")[0];
            if (srgbClr) {
              fillColor = `#${srgbClr.getAttribute("val")}`;
            }
          }

          // 边框
          const ln = spPr?.getElementsByTagName("a:ln")[0];
          let borderColor = "#000000",
            borderWidth = 0;
          if (ln) {
            const lnFill = ln.getElementsByTagName("a:solidFill")[0];
            if (lnFill) {
              const lnClr = lnFill.getElementsByTagName("a:srgbClr")[0];
              if (lnClr) {
                borderColor = `#${lnClr.getAttribute("val")}`;
              }
            }
            const w = ln.getAttribute("w");
            if (w) {
              borderWidth = parseInt(w, 10) / 12700;
            }
          }

          // 文本内容和样式
          const txBody = sp.getElementsByTagName("p:txBody")[0];
          const tElements = txBody?.getElementsByTagName("a:t");
          const rPrElements = txBody?.getElementsByTagName("a:rPr");

          const texts = [];
          if (tElements) {
            for (let i = 0; i < tElements.length; i++) {
              const text = tElements[i].textContent || "";
              const rPr = rPrElements[i];

              let fontSize = "20px",
                color = "#000000",
                typeface = "Arial",
                fontWeight = "normal",
                fontStyle = "normal";
              if (rPr) {
                const sz = rPr.getAttribute("sz");
                if (sz) {
                  fontSize = `${parseInt(sz, 10) / 100}pt`;
                }

                const textFill = rPr.getElementsByTagName("a:solidFill")[0];
                if (textFill) {
                  const textClr = textFill.getElementsByTagName("a:srgbClr")[0];
                  if (textClr) {
                    color = `#${textClr.getAttribute("val")}`;
                  }
                }

                const latin = rPr.getElementsByTagName("a:latin")[0];
                if (latin) {
                  typeface = latin.getAttribute("typeface") || typeface;
                }

                if (rPr.getAttribute("b") === "1") {
                  fontWeight = "bold";
                }
                if (rPr.getAttribute("i") === "1") {
                  fontStyle = "italic";
                }
              }

              texts.push({
                text,
                fontSize,
                color,
                typeface,
                fontWeight,
                fontStyle,
              });
            }
          }

          elements.push({
            x,
            y,
            width,
            height,
            rotation,
            fillColor,
            borderColor,
            borderWidth,
            texts,
          });
        }

        const bgElement = slideDoc.getElementsByTagName("p:bg")[0];
        let backgroundColor = "#ffffff";
        if (bgElement) {
          const solidFill = bgElement.getElementsByTagName("a:solidFill")[0];
          if (solidFill) {
            const srgbClr = solidFill.getElementsByTagName("a:srgbClr")[0];
            if (srgbClr) {
              backgroundColor = `#${srgbClr.getAttribute("val")}`;
            }
          }
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = slideWidth / 12700;
          canvas.height = slideHeight / 12700;

          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);

          function drawTextWithWrapping(
            context: CanvasRenderingContext2D,
            text: string,
            x: number,
            y: number,
            maxWidth: number,
            lineHeight: number
          ): number {
            console.log("text", text);

            const words = text.split("");
            let line = "";
            let currentY = y;
            console.log(words);

            words.forEach((word, index) => {
              const testLine = line + word + "";
              const metrics = context.measureText(testLine);
              const testWidth = metrics.width;

              console.log(line, x, currentY);
              if (testWidth > maxWidth && line !== "") {
                context.fillText(line, x, currentY);
                line = word + " ";
                currentY += lineHeight;
              } else {
                line = testLine;
              }
            });

            if (line !== "") {
              context.fillText(line, x, currentY);
              currentY += lineHeight;
            }

            return currentY;
          }

          // 绘制形状和文本
          elements.forEach(
            ({
              x,
              y,
              width,
              height,
              rotation,
              fillColor,
              borderColor,
              borderWidth,
              texts,
            }) => {
              context.save();
              context.translate(x + width / 2, y + height / 2);
              context.rotate((rotation * Math.PI) / 180);
              context.translate(-(x + width / 2), -(y + height / 2));

              context.fillStyle = fillColor;
              context.fillRect(x, y, width, height);

              context.lineWidth = borderWidth;
              context.strokeStyle = borderColor;
              context.strokeRect(x, y, width, height);

              context.restore();

              let currentY = y; // 初始文本 y 位置

              texts.forEach(
                ({
                  text,
                  fontSize,
                  color,
                  typeface,
                  fontWeight,
                  fontStyle,
                }) => {
                  context.fillStyle = color;
                  context.font = `${fontStyle} ${fontWeight} ${fontSize} ${typeface}`;

                  const lineHeight = parseInt(fontSize, 10) + 8; // 行高调整
                  const maxWidth = width; // 考虑文本框的内边距

                  currentY = drawTextWithWrapping(
                    context,
                    text,
                    x,
                    currentY + 5,
                    maxWidth,
                    lineHeight
                  );
                }
              );
            }
          );

          // 绘制图片
          for (let pic of picElements) {
            const blip = pic.getElementsByTagName("a:blip")[0];
            const embed = blip?.getAttribute("r:embed");

            const xfrm = pic.getElementsByTagName("a:xfrm")[0];
            const off = xfrm?.getElementsByTagName("a:off")[0];
            const ext = xfrm?.getElementsByTagName("a:ext")[0];

            let x = 0,
              y = 0,
              width = 0,
              height = 0;

            if (off) {
              x = parseInt(off.getAttribute("x"), 10) / 12700;
              y = parseInt(off.getAttribute("y"), 10) / 12700;
            }

            if (ext) {
              width = parseInt(ext.getAttribute("cx"), 10) / 12700;
              height = parseInt(ext.getAttribute("cy"), 10) / 12700;
            }

            if (embed) {
              const imagePath = await getResourcePath(zip, fileName, embed);
              if (imagePath && zip.files[imagePath]) {
                const imageData = await zip.files[imagePath].async("base64");
                const imageSrc = `data:image/png;base64,${imageData}`;

                const img = new Image();
                img.src = imageSrc;
                await new Promise((resolve) => {
                  img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    if (width / height > aspectRatio) {
                      width = height * aspectRatio;
                    } else {
                      height = width / aspectRatio;
                    }
                    context.drawImage(img, x, y, width, height);
                    resolve(null);
                  };
                });
              }
            }
          }

          const slideImage = canvas.toDataURL("image/png");

          return {
            slideImage,
            elements: elements
              .map((e) => e.texts.map((t) => t.text).join("\n"))
              .join("\n"),
            backgroundColor,
          };
        }

        return null;
      });

      const contents = await Promise.all(slidePromises);

      setSlideImages(contents.map((content) => content?.slideImage || ""));
      setSlideContents(contents.map((content) => content?.elements || ""));
      setBackgroundStyles(
        contents.map((content) => content?.backgroundColor || "")
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
