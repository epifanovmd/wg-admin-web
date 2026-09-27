import { fireEvent, render, screen } from "@testing-library/react";

import { Input } from "../../../input";
import { TooltipProvider } from "../../../tooltip";
import { Field } from "../Field";

describe("Field", () => {
  it("renders an outside label by default", () => {
    render(
      <Field htmlFor="name" label="Name">
        <Input id="name" placeholder="Enter name" />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Name" });
    const field = input.closest('[data-slot="field"]');

    expect(field).toHaveAttribute("data-label-placement", "outside");
    expect(input).toHaveAttribute("placeholder", "Enter name");
    expect(field?.querySelector('[data-slot="field-control"]')).toBeNull();
  });

  it("keeps a floating label associated with its input", () => {
    render(
      <Field
        error="Required"
        htmlFor="email"
        label="Email"
        labelPlacement="floating"
        required
      >
        <Input id="email" placeholder="name@example.com" size="lg" />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: /Email/ });
    const field = input.closest('[data-slot="field"]');
    const control = field?.querySelector('[data-slot="field-control"]');

    expect(field).toHaveAttribute("data-label-placement", "floating");
    expect(control).toContainElement(input);
    expect(control).toHaveClass(
      "[&_[data-slot=input]]:placeholder:opacity-0",
      "focus-within:[&_[data-slot=input]]:placeholder:opacity-100",
    );
    expect(input).toHaveAttribute("placeholder", "name@example.com");
    expect(screen.getByText("Required")).toHaveAttribute("role", "alert");
    expect(input.closest('[data-slot="input-root"]')).toHaveAttribute(
      "data-size",
      "lg",
    );
  });

  it("exposes value presence used to keep the label floated", () => {
    render(
      <Field htmlFor="city" label="City" labelPlacement="floating">
        <Input id="city" />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "City" });
    const inputRoot = input.closest('[data-slot="input-root"]');

    expect(inputRoot).toHaveAttribute("data-has-value", "false");

    fireEvent.change(input, { target: { value: "Moscow" } });
    expect(inputRoot).toHaveAttribute("data-has-value", "true");

    fireEvent.change(input, { target: { value: "" } });
    expect(inputRoot).toHaveAttribute("data-has-value", "false");
  });

  it("renders the hint as a focusable button with a Russian label", () => {
    render(
      <TooltipProvider>
        <Field hint="Подробности" htmlFor="login" label="Логин">
          <Input id="login" />
        </Field>
      </TooltipProvider>,
    );

    const hint = screen.getByRole("button", { name: "Подсказка" });

    expect(hint).toHaveAttribute("type", "button");
    expect(hint).not.toHaveAttribute("tabindex", "-1");
  });

  it("places the description before the error and applies className to the root", () => {
    render(
      <Field
        className="custom-field"
        description="Описание"
        descriptionId="d"
        error={<strong>Ошибка</strong>}
        errorId="e"
        htmlFor="f"
        label="Поле"
      >
        <Input id="f" />
      </Field>,
    );

    const description = screen.getByText("Описание");
    const error = screen.getByRole("alert");
    const field = description.closest('[data-slot="field"]');

    expect(field).toHaveClass("custom-field");
    expect(error).toHaveTextContent("Ошибка");
    expect(error.querySelector("strong")).not.toBeNull();
    expect(
      description.compareDocumentPosition(error) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
