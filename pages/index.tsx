import Head from "next/head";
import { ReactElement, useEffect, useRef, useState } from "react";
import Styles from "../src/assets/main.module.css";

interface IEntityPropertiesRows {
  name: string;
  pk?: boolean;
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
  pk?: boolean;
}

type IDrawEntityTable = Omit<IDrawEntityBase, "color" | "pk">;
type IDrawEntityHeader = Omit<
  IDrawEntityBase,
  "properties" | "color" | "name" | "img" | "pk"
>;
type IDrawEntityProperty = Omit<
  IDrawEntityBase,
  "properties" | "name" | "img" | "pk"
>;
type IDrawEntityTextHeader = Omit<
  IDrawEntityBase,
  "properties" | "color" | "img" | "pk"
>;
type IDrawEntityTextProperty = Omit<
  IDrawEntityBase,
  "properties" | "color" | "img"
>;

interface ISvgImages {
  tableIcon: string;
  primaryKeyIcon: string;
}

function Index(): ReactElement<HTMLDivElement> {
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const [entities] = useState<IEntityTable[]>([
    {
      width: 300,
      x: 100,
      y: 50,
      height: 50,
      name: "productos",
      properties: {
        height: 40,
        rows: [
          {
            name: "id",
            pk: true,
          },
          {
            name: "name",
          },
          {
            name: "enable",
          },
          {
            name: "FechaNacimiento",
          },
          {
            name: "Texto",
          },
          {
            name: "Example",
          },
        ],
      },
    },
    {
      width: 250,
      x: 600,
      y: 300,
      height: 38,
      name: "Pais",
      properties: {
        height: 38,
        rows: [
          {
            name: "id",
          },
        ],
      },
    },
  ]);
  const [svgImages, setSvgImages] = useState<ISvgImages>({
    tableIcon: "/tableIcon.svg",
    primaryKeyIcon: "/primaryKeyIcon.svg",
  });

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);

    return () => {
      window.removeEventListener("resize", draw);
    };
  }, []);

  const draw = (): void => {
    const canvas = refCanvas.current;

    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        drawBackground(ctx, canvas.width, canvas.height);
        entities.forEach((entity) => {
          const { x, y, width, height, properties, name } = entity;
          drawEntityTable({ ctx, x, y, width, height, properties, name });
          drawSVGLoad(ctx, x, y, height, svgImages.tableIcon);
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
    drawEntityTextHeader({ ctx, x, y, width, height, name });

    rows.forEach((row: IEntityPropertiesRows, index: number) => {
      const { name, pk } = row;
      const propertyY: number = y + height + heightProperty * index;

      drawEntityProperty({
        ctx,
        x,
        y: propertyY,
        width,
        height: heightProperty,
        color: "rgb(50, 50, 50)",
      });

      drawEntityTextProperty({
        ctx,
        x,
        y: propertyY,
        width,
        height: heightProperty,
        name,
        pk,
      });

      if (pk)
        drawSVGLoad(
          ctx,
          svgImages.primaryKeyIcon,
          x,
          propertyY,
          height,
          20,
          20
        );

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

  const drawEntityTextHeader = (prompts: IDrawEntityTextHeader): void => {
    const { ctx, y, x, width, height, name } = prompts;
    ctx.beginPath();
    ctx.font =
      "500 15px Inter var,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emojif";
    ctx.fillStyle = "white";
    ctx.fillText(name, x + 45, y + height / 2 + 5);
  };

  const drawEntityTextProperty = (prompts: IDrawEntityTextProperty): void => {
    const { ctx, y, x, width, height, name, pk } = prompts;
    ctx.beginPath();
    ctx.font = `${
      !pk ? "300" : "500"
    } 15px Inter var,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emojif`;
    ctx.fillStyle = "white";
    const positionX: number = !pk ? x + 20 : x + 50;
    ctx.fillText(name, positionX, y + height / 2 + 5);
  };

  const drawSVG = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null,
    x: number,
    y: number,
    height: number,
    widthImage: number,
    heightImage: number
  ): void => {
    if (img) {
      ctx.drawImage(img, x + 15, y + height / 2 - 13, widthImage, heightImage);
    }
  };

  const drawSVGLoad = (
    ctx: CanvasRenderingContext2D,
    image: string,
    x: number,
    y: number,
    height: number,
    widthImage: number,
    heightImage: number
  ): void => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      drawSVG(ctx, img, x, y, height, widthImage, heightImage);
    };
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
