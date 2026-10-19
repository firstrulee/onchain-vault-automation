import React from "react";
import { Composition } from "remotion";
import { OnChainVaultShort, OnChainVaultProps } from "./OnChainVaultShort";
import defaultProps from "../public/ep01_props.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OnChainVaultShort"
        component={OnChainVaultShort}
        durationInFrames={defaultProps.durationInFrames || 1409}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps as OnChainVaultProps}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: props.durationInFrames || 1409,
            fps: 30,
            width: 1080,
            height: 1920,
          };
        }}
      />
    </>
  );
};
