import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

const PptxViewer: React.FC = () => {
  const pptUrl = "https://dev-nts2024-truthaid-s3.truth-ai.com.cn/public/test.pptx";
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchPPTXFile = async () => {
      try {
        const response = await fetch(pptUrl);
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // 提取特定的图像文件
        const imageFile = zip.file('ppt/media/image1.png');
        if (imageFile) {
          const imageData = await imageFile.async('base64');
          setImageSrc(`data:image/png;base64,${imageData}`);
        } else {
          console.error('Image not found');
        }
      } catch (error) {
        console.error("Error fetching or processing PPTX file:", error);
      }
    };

    fetchPPTXFile();
  }, [pptUrl]);

  return (
    <div>
      <h1>PPTX 图像预览</h1>
      {imageSrc ? (
        <img src={imageSrc} alt="PPT Image" style={{ maxWidth: '100%' }} />
      ) : (
        <p>加载中或图像不可用</p>
      )}
    </div>
  );
};

export default PptxViewer;
