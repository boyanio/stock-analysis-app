import React from "react";

type Props = {
  value: number;
};

export default function Money({ value }: Props) {
  return (
    <>
      💰<span className="format">{value.toFixed(2)}</span>
    </>
  );
}
