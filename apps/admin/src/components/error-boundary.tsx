// components/ErrorBoundary.tsx
"use client";

import Image from "next/image";
import React from "react";

import { ImageAssets } from "@/utils/image-assets";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={"flex size-full flex-col items-center justify-center"}>
          <Image
            src={ImageAssets.ICON_505}
            alt={"505 Error"}
            className={"h-[222.341px] w-[222.341px] object-contain"}
          />
          <h2 className="text-secondary-foreground mt-6">
            Something went wrong.
          </h2>
        </div>
      );
    }
    return this.props.children;
  }
}
