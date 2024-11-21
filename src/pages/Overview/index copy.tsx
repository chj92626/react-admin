import React, { Component } from "react";
import JSZip from "jszip";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

class PPTXToPDF extends Component {
  state = {
    pdfUrl: null,
  };

  componentDidMount() {
    this.convertPptxToPdf();
  }

  convertPptxToPdf = async () => {
    try {
      // 1. 获取 PPTX 文件
      const pptxUrl = "https://dev-nts2024-truthaid-s3.truth-ai.com.cn/public/test.pptx";
      const pptxResponse = await fetch(pptxUrl);
      if (!pptxResponse.ok) {
        throw new Error("无法获取 PPTX 文件");
      }
      const pptxArrayBuffer = await pptxResponse.arrayBuffer();
      if (pptxArrayBuffer.byteLength === 0) {
        throw new Error("PPTX 文件为空");
      }

      // 2. 使用 JSZip 加载 PPTX
      const zip = await JSZip.loadAsync(pptxArrayBuffer);

      // 3. 创建新的 PDF 文档
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // 4. 加载并嵌入中文字体
      const fontUrl = "/fonts/NotoSansCJK-wght-400-900.ttf.ttc"; // 请确保字体文件位于 public/fonts 目录中
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
        throw new Error("无法加载字体文件");
      }
      const fontBytes = await fontResponse.arrayBuffer();
      const customFont = await pdfDoc.embedFont(fontBytes);

      // 5. 提取幻灯片并添加到 PDF
      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.startsWith("ppt/slides/slide")
      );

      for (let fileName of slideFiles) {
        const slideXml = await zip.files[fileName].async("string");
        const parser = new DOMParser();
        const slideDoc = parser.parseFromString(slideXml, "application/xml");

        // 提取幻灯片中的文本
        const texts = slideDoc.getElementsByTagName("a:t");
        let slideText = "";
        for (let textElement of texts) {
          slideText += textElement.textContent + " ";
        }

        // 为每个幻灯片添加一个新的 PDF 页面
        const page = pdfDoc.addPage([600, 400]);
        const { width, height } = page.getSize();

        page.drawText(slideText.trim(), {
          x: 50,
          y: height - 50,
          size: 12,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }

      // 6. 保存 PDF 文档并创建 Blob URL
      const pdfBytes = await pdfDoc.save();
      const pdfUrl = URL.createObjectURL(
        new Blob([pdfBytes], { type: "application/pdf" })
      );
      this.setState({ pdfUrl });
    } catch (error) {
      console.error("将 PPTX 转换为 PDF 时出错：", error);
    }
  };

  render() {
    const { pdfUrl } = this.state;

    return (
      <div>
        {pdfUrl ? (
          <iframe src={pdfUrl} width="100%" height="600px" title="PDF 预览" />
        ) : (
          <p>正在加载 PDF...</p>
        )}
      </div>
    );
  }
}

export default PPTXToPDF;
