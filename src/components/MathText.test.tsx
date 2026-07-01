import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MathText } from "@/components/MathText";

describe("MathText", () => {
  it("renders escaped dollar signs literally without treating them as math delimiters", () => {
    const { container } = render(<MathText text={"Apples cost \\$12.50 and $8$ pounds cost more."} />);

    expect(container).toHaveTextContent("$12.50");
    expect(container.querySelectorAll(".katex")).toHaveLength(1);
  });

  it("renders dollar signs inside KaTeX when they are escaped inside math", () => {
    const { container } = render(<MathText text={"$\\$12.50 \\div 5 = \\$2.50$"} />);

    expect(container).toHaveTextContent("$12.50");
    expect(container).toHaveTextContent("$2.50");
    expect(container.querySelector(".katex")).toBeInTheDocument();
  });
});
