// 可以展示内容
import React, { useState, ChangeEvent } from 'react';
import JSZip from 'jszip';

const PptxViewer: React.FC = () => {
  const [slideContents, setSlideContents] = useState<string[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      readPPTXFile(file);
    } else {
      alert("请上传一个有效的 PPTX 文件");
    }
  };

  const readPPTXFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.startsWith("ppt/slides/slide")
      );

      const slidePromises = slideFiles.map(async (fileName) => {
        const slideXml = await zip.files[fileName].async("string");
        const parser = new DOMParser();
        const slideDoc = parser.parseFromString(slideXml, "application/xml");

        const texts: string[] = [];
        const spElements = slideDoc.getElementsByTagName("p:sp");
        for (let sp of spElements) {
          const tElements = sp.getElementsByTagName("a:t");
          for (let t of tElements) {
            if (t.textContent) {
              texts.push(t.textContent);
            }
          }
        }

        return texts.join("\n") || "幻灯片没有文本内容";
      });

      const contents = await Promise.all(slidePromises);
      setSlideContents(contents);
      setSelectedSlideIndex(0); // 默认选择第一张幻灯片
    } catch (error) {
      console.error("Error reading PPTX file:", error);
      alert("读取 PPTX 文件时出错");
    }
  };

  return (
    <div>
      <h1>PPTX 文件预览</h1>
      <input type='file' accept='.pptx' onChange={handleFileChange} />
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={{ width: '180px', borderRight: '1px solid black' }}>
          {slideContents.map((_, index) => (
            <div
              key={index}
              onClick={() => setSelectedSlideIndex(index)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: selectedSlideIndex === index ? '#f0f0f0' : 'white',
              }}
            >
              缩略图 {index + 1}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '10px' }}>
          {selectedSlideIndex !== null && (
            <div>
              <h3>幻灯片 {selectedSlideIndex + 1}</h3>
              <pre>{slideContents[selectedSlideIndex]}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PptxViewer;
