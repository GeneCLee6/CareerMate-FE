import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import SelectField, { SelectOption } from "./SelectField";

const OPTIONS: SelectOption[] = [
    { value: "FE", label: "Frontend" },
    { value: "BE", label: "Backend" },
];

/** Controlled, the way the pages use it. */
const Harness = ({ initial = "" }: { initial?: string }) => {
    const [value, setValue] = useState(initial);
    return (
        <>
            <SelectField
                id="field"
                label="Your Field"
                options={OPTIONS}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <output data-testid="value">{value}</output>
        </>
    );
};

describe("the placeholder", () => {
    it("is shown while nothing is chosen", () => {
        render(<Harness />);
        expect(
            screen.getByRole("combobox", { name: "Your Field" })
        ).toHaveDisplayValue("Select an option");
    });

    it("is not one of the choices", () => {
        // It used to sit in the list, reading like an option called
        // "Selected". It is a prompt, not something to pick.
        render(<Harness />);
        const options = screen.getAllByRole("option", { hidden: true });
        const placeholder = options.find((o) => o.textContent === "Select an option");

        expect(placeholder).toBeDisabled();
        expect(placeholder).toHaveAttribute("hidden");
    });

    it("cannot be chosen back once a value is set", async () => {
        // Picking it used to clear the field and grey the text out, which
        // looked like the control breaking.
        const user = userEvent.setup();
        render(<Harness initial="FE" />);
        const select = screen.getByRole("combobox", { name: "Your Field" });

        await user.selectOptions(select, "BE");
        expect(screen.getByTestId("value")).toHaveTextContent("BE");

        // The disabled option is not selectable; the value stands.
        expect(select).toHaveDisplayValue("Backend");
    });

    it("can be given different wording", () => {
        render(
            <SelectField
                id="role"
                label="Your Role"
                options={OPTIONS}
                placeholder="Pick one"
                value=""
                onChange={() => {}}
            />
        );
        expect(
            screen.getByRole("combobox", { name: "Your Role" })
        ).toHaveDisplayValue("Pick one");
    });
});

describe("the options", () => {
    it("renders every choice", () => {
        render(<Harness />);
        expect(screen.getByRole("option", { name: "Frontend" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Backend" })).toBeInTheDocument();
    });

    it("reports the chosen value", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.selectOptions(
            screen.getByRole("combobox", { name: "Your Field" }),
            "FE"
        );
        expect(screen.getByTestId("value")).toHaveTextContent("FE");
    });
});
