import * as React from "react"
import Label from "../../label"
import "./text-view.css"

const ID = "ui-view-input-TextView"

export interface TextViewProps {
    className?: string
    value: string
    label?: string
    /** List of suggestions for autocompletion. */
    suggestions?: string[]
    /** Should we ask for focus at mounting? */
    autoFocus?: boolean
    size?: number
    enabled?: boolean
    wide?: boolean
    error?: string | null
    /** A function or RegExp to validate the entry. */
    validator?: RegExp | ((value: string) => boolean)
    /** This is triggered only if the entry is valid. */
    onChange?(this: void, value: string): void
    /** Is the current entry valid? */
    onValidation?(this: void, valid: boolean): void
    /** Triggered whn the user pressed the ENTER key. */
    onEnterPressed?(this: void, value: string): void
}

let globalId = 1

function nextId() {
    return `${ID}-${globalId++}`
}

export default function TextView(props: TextViewProps) {
    const id = useId()
    const [text, setText] = React.useState(props.value)
    const [valid, setValid] = React.useState(isValid(props.value))
    const handleChange = useChangeHandler(
        setText,
        setValid,
        props.validator,
        props.onChange,
        props.onValidation
    )
    const handleFocus = makeFocusHandler()
    const handleKeyDown = useKeyDownHandler(props, text)
    React.useEffect(() => setText(props.value), [props.value])
    const listId = `${id}:datalist`
    return (
        <div className={getClassNames(props, valid)}>
            <Label value={props.label} target={id} />
            {props.suggestions && (
                <datalist id={listId}>
                    {props.suggestions.map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                    ))}
                </datalist>
            )}
            <input
                id={id}
                size={props.size}
                list={listId}
                value={text}
                autoFocus={props.autoFocus}
                disabled={props.enabled === false ? true : undefined}
                onChange={handleChange}
                onKeyDownCapture={handleKeyDown}
                onFocus={handleFocus}
                autoComplete={"off"}
            />
            <Label
                error={true}
                visible={Boolean(props.error)}
                value={props.error}
            />
        </div>
    )
}

function makeFocusHandler() {
    return (evt: React.FocusEvent<HTMLInputElement>) => {
        // When Input gets the focus, we select the whole content.
        const input = evt.target
        input.selectionStart = 0
        input.selectionEnd = input.value.length
    }
}

function useId() {
    const [id, setId] = React.useState("")
    React.useEffect(() => setId(nextId()), [])
    return id
}

function useKeyDownHandler(props: TextViewProps, text: string) {
    return React.useCallback(
        (evt: React.KeyboardEvent<HTMLInputElement>) => {
            if (evt.key !== "Enter") return

            if (isValid(text)) {
                if (props.onChange) props.onChange(text)
                if (props.onEnterPressed) props.onEnterPressed(text)
            }
        },
        [text, props.onChange, props.onEnterPressed]
    )
}

function getClassNames(props: TextViewProps, valid: boolean): string {
    const classNames = ["custom", ID]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.wide === true) classNames.push("wide")
    if (valid === false) classNames.push("invalid")
    if (props.label) classNames.push("with-label")

    return classNames.join(" ")
}

function useChangeHandler(
    setText: (value: string) => void,
    setValid: (value: boolean) => void,
    validator?: RegExp | ((value: string) => boolean),
    onChange?: (this: void, value: string) => void,
    onValidation?: (this: void, value: boolean) => void
) {
    const debouncedChangeHandler = React.useCallback(
        (newText: string) => {
            if (onChange) onChange(newText)
        },
        [onChange]
    )
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newText = evt.target.value
        setText(newText)
        const validity = isValid(newText, validator)
        if (onValidation) onValidation(validity)
        setValid(validity)
        if (!validity) return

        void debouncedChangeHandler(newText)
    }
}

/**
 * Use a validator to check value's validity.
 */
function isValid(
    value: string,
    validator?: RegExp | ((v: string) => boolean)
): boolean {
    if (!validator) return true
    if (typeof validator === `function`) {
        try {
            return validator(value)
        } catch (ex) {
            return false
        }
    }
    validator.lastIndex = -1
    return validator.test(value)
}
