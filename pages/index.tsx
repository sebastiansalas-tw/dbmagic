import Head from "next/head";
import { ReactElement, useEffect, useRef, useState } from "react";
import Styles from "../src/assets/main.module.css";
import EntitiesJSON from "../src/json/entities.json";

interface IEntityPropertiesRows {
  name: string;
  type: string;
  pk?: boolean;
  nn?: boolean;
}

interface IEntityProperty {
  height: number;
  rows: IEntityPropertiesRows[];
}

interface IEntityTable {
  width: number;
  x: number;
  y: number;
  height: number;
  name: string;
  properties: IEntityProperty;
}

interface IDrawEntityBase {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: IEntityProperty;
  color: string;
  name: string;
  align: CanvasTextAlign;
  type: string;
  pk?: boolean;
  nn?: boolean;
}

type IDrawEntityTable = Omit<IDrawEntityBase, "color" | "pk" | "align" | "type">;
type IDrawEntityHeader = Omit<
  IDrawEntityBase,
  "properties" | "color" | "name" | "img" | "pk" | "align" | "type"
>;
type IDrawEntityProperty = Omit<
  IDrawEntityBase,
  "properties" | "name" | "img" | "pk" | "align" | "type"
>;
type IDrawEntityText = Omit<
  IDrawEntityBase,
  "properties" | "img"
>;

interface ISvgImages {
  [tableIcon: string]: string;
  primaryKeyIcon: string;
};

interface IDrawSvg {
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  x: number;
  y: number;
  height: number;
  widthImage: number;
  heightImage: number;
};

interface IFontFamilyPrompts {
  fontSize: string;
  fontWeight?: number;
};

interface IFontFamily {
  [textProperty: string]: (prompts: IFontFamilyPrompts) => string;
  typeProperty: (prompts: IFontFamilyPrompts) => string;
}

function Index(): ReactElement<HTMLDivElement> {
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const [entities] = useState<IEntityTable[]>(EntitiesJSON);
  const [svgImages] = useState<ISvgImages>({
    tableIcon: "/tableIcon.svg",
    primaryKeyIcon: "/primaryKeyIcon.svg",
    nullableIcon: "/nullableIcon.svg",
    notNullableIcon: "/notNullableIcon.svg",
  });
  const [zoom, setZoom] = useState<number>(1);
  const [loadedImages, setLoadedImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const [fontFamily] = useState<IFontFamily>({
    textProperty: (prompts: IFontFamilyPrompts) =>
      `${prompts.fontWeight} ${prompts.fontSize} Inter var,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emojif`,
    typeProperty: (prompts: IFontFamilyPrompts) =>
      `${prompts.fontSize} consolas,monospace`,
  });

  useEffect(() => {
    if (Object.keys(loadedImages).length === Object.keys(svgImages).length) {
      draw();
      window.addEventListener("resize", draw);

      return () => {
        window.removeEventListener("resize", draw);
      };
    }
  }, [loadedImages, zoom]);

  useEffect(() => {
    const loadImages = async () => {
      const images: { [key: string]: HTMLImageElement } = {};
      for (const key in svgImages) {
        const img = new Image();
        img.src = svgImages[key];
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        images[key] = img;
      }
      setLoadedImages(images);
    };

    loadImages();
  }, [svgImages]);

  const draw = (): void => {
    const canvas = refCanvas.current;

    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.scale(dpr * zoom, dpr * zoom);
        drawBackground(ctx, canvas.width, canvas.height);
        entities.forEach((entity) => {
          const { x, y, width, height, properties, name } = entity;
          drawEntityTable({ ctx, x, y, width, height, properties, name });
          drawSVG({
            ctx,
            x: x + 14,
            y: y + height / 2 - 13,
            height,
            image: loadedImages.tableIcon,
            widthImage: 25,
            heightImage: 25,
          });
        });
      }
    }
  };

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void => {
    ctx.beginPath();
    ctx.fillStyle = "#121722";
    ctx.fillRect(0, 0, width, height);
    ctx.stroke();
  };

  const drawEntityTable = (prompts: IDrawEntityTable): void => {
    const { ctx, x, y, width, height, properties, name } = prompts;
    const { rows, height: heightProperty } = properties;
    drawHeaderTable({ ctx, x, y, width, height });
    drawEntityText({
      ctx,
      x: x + 5,
      y,
      width,
      height,
      name,
      pk: false,
      nn: false,
      align: "left",
      type: "titleTable",
      color: "white",
    });

    rows.forEach((row: IEntityPropertiesRows, index: number) => {
      const { name, type, pk, nn } = row;
      const propertyY: number = y + height + heightProperty * index;
      let addPositionXText: number = 0;

      drawEntityProperty({
        ctx,
        x,
        y: propertyY,
        width,
        height: heightProperty,
        color: "rgb(50, 50, 50)",
      });

      drawEntityText({
        ctx,
        x,
        y: propertyY,
        width,
        height: heightProperty,
        name,
        pk,
        nn,
        align: "left",
        type: "textProperty",
        color: "white",
      });

      drawEntityText({
        ctx,
        x,
        y: propertyY,
        width,
        height: heightProperty,
        name: type,
        pk,
        nn,
        align: "right",
        type: "typeProperty",
        color: "rgb(200, 200, 200)",
      });

      if (pk) {
        addPositionXText += 22;

        drawSVG({
          ctx,
          image: loadedImages.primaryKeyIcon,
          x: x + 16,
          y: propertyY + 8,
          height,
          widthImage: 20,
          heightImage: 20,
        });
      }

      drawSVG({
        ctx,
        image: nn ? loadedImages.notNullableIcon : loadedImages.nullableIcon,
        x: x + addPositionXText + 17,
        y: propertyY + 10,
        height,
        widthImage: 18,
        heightImage: 18,
      });

      if (index > 0) {
        drawEntityLineProperty({
          ctx,
          x,
          y: propertyY,
          width,
          height: 1,
          color: "rgb(100, 100, 100)",
        });
      }
    });
  };

  const drawHeaderTable = (prompts: IDrawEntityHeader): void => {
    const { ctx, x, y, width, height } = prompts;
    const radius: number = 7;
    ctx.beginPath();
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);

    ctx.fillStyle = "rgb(100, 100, 100)";
    ctx.fill();
  };

  const drawEntityProperty = (prompts: IDrawEntityProperty): void => {
    const { ctx, x, y, width, height, color } = prompts;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawEntityLineProperty = (prompts: IDrawEntityProperty): void => {
    const { ctx, x, y, width, height, color } = prompts;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = height;
    ctx.stroke();
  };

  const drawEntityTextHeader = (prompts: IDrawEntityText): void => {
    const { ctx, y, x, height, name } = prompts;
    ctx.beginPath();
    ctx.font =
      "500 15px Inter var,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emojif";
    ctx.fillStyle = "white";
    ctx.fillText(name, x + 45, y + height / 2 + 5);
  };

  const drawEntityText = (prompts: IDrawEntityText): void => {
    const { ctx, y, x, height, width, name, pk, align, type, color } = prompts;
    ctx.beginPath();
    if (type === "textProperty") {
      ctx.font = fontFamily.textProperty({
        fontSize: "15px",
        fontWeight: !pk ? 300 : 500,
      });
    }

    if (type === "typeProperty") {
      ctx.font = fontFamily.typeProperty({
        fontSize: "11px",
      });
    }

    if(type === "titleTable"){
      ctx.font = fontFamily.textProperty({
        fontSize: "15px",
        fontWeight: 500,
      });
    }

    const textMetrics = ctx.measureText(name);
    const textWidth = textMetrics.width;


    ctx.fillStyle = color;
    ctx.textAlign = align;

    let addPositionX: number = 20;

    if (pk) {
      addPositionX += 22;
    }

    addPositionX += 22;

    let textX: number = x + addPositionX;

    if(type === "typeProperty"){
      textX = x + width - 15;
    }

    ctx.fillText(name, textX, y + height / 2 + 5);
  };

  const drawSVG = (prompts: IDrawSvg): void => {
    const { ctx, image, x, y, height, widthImage, heightImage } = prompts;
      
    ctx.drawImage(image, x, y, widthImage, heightImage);
  };

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.svg" />
        <title>dbMagic - The magic of databases</title>
      </Head>
      <canvas ref={refCanvas} className={Styles.canvas}></canvas>
    </>
  );
}

export default Index;
