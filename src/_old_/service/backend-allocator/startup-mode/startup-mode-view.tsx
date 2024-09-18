import * as React from "react"
import Button from "@/_old_/ui/view/button"
import InputText from "@/_old_/ui/view/input/text"
import { BACKEND_URL_STORAGE_KEY } from "@/_old_/constants"
import { useLocalStorageState } from "@/_old_/ui/hooks"
import Style from "./startup-mode-view.module.css"
import Runnable from "@/_old_/ui/view/runnable/runnable-view"
import Icon from "@/_old_/ui/view/icon"
import HelpButton from "@/_old_/view/help-button"
import { ModalProvider } from "../../../ui/modal"
import { getCleanServiceUrl } from "@/_old_/service/backend-allocator/clean-backend-address"
import config from "@/_old_/config"

export interface StartupModeViewProps {
    onAllocateNode(
        this: void,
        account: string,
        onProgress: (message: string) => void
    ): void
    onUseExistingBackend(this: void, backendUrl: string): void
}

const RX_ACCOUNT_VALIDATOR = /^proj[0-9]+$/gu

const BackgroundURL = "background.jpg"

/**
 * Give the user the choice between allocating a new node
 * or using an existing backend.
 */
export default function StartupModeView(props: StartupModeViewProps) {
    const [message, setMessage] = React.useState("")
    const [isBusy, setIsBusy] = React.useState(false)
    const [isBackgroundLoaded, setIsBackgroundLoaded] = React.useState(false)
    const { onAllocateNode, onUseExistingBackend } = props
    const [account, setAccount] = useLocalStorageState(
        "proj3",
        "startup-mode-view/account"
    )
    const [isAccountValid, setIsAccountValid] = React.useState(true)
    const [userCustomAddress, setUserCustomAddress] = useLocalStorageState(
        "",
        BACKEND_URL_STORAGE_KEY
    )
    const cleanBackendUrl = React.useMemo(
        () =>
            getCleanServiceUrl(userCustomAddress, {
                protocol: config.backendProtocol,
                port: config.backendPort,
            }),
        [userCustomAddress]
    )
    const isUserAddressValid: boolean = React.useMemo(
        () => cleanBackendUrl !== null,
        [userCustomAddress]
    )
    const handleAccountClick = () => {
        if (isAccountValid) {
            setIsBusy(true)
            setMessage("Contacting UNICORE...")
            onAllocateNode(account, setMessage)
        }
    }
    const handleAddressclick = () => {
        if (isUserAddressValid && cleanBackendUrl) {
            setIsBusy(true)
            onUseExistingBackend(cleanBackendUrl.toString())
        }
    }

    return (
        <ModalProvider>
            <div className={Style.startupMode}>
                <img
                    className={isBackgroundLoaded ? Style.show : ""}
                    src={BackgroundURL}
                    onLoad={() => setIsBackgroundLoaded(true)}
                />
                <header>
                    <h1>{document.title}</h1>
                    {message && (
                        <div className={Style.message}>
                            <Icon name="gear" />
                            <div>{message}</div>
                        </div>
                    )}
                </header>
                <Runnable running={isBusy}>
                    {renderUnicoreAllocation(
                        account,
                        setAccount,
                        setIsAccountValid,
                        handleAccountClick,
                        isAccountValid
                    )}
                </Runnable>
                <Runnable running={isBusy}>
                    {renderDirectAccess(
                        userCustomAddress,
                        setUserCustomAddress,
                        handleAddressclick,
                        isUserAddressValid
                    )}
                </Runnable>
                <footer>
                    <img src="epfl-logo.png" />
                    <div>
                        Powered by &nbsp;<b>Viz Team</b>
                    </div>
                    <img src="bbp-logo.png" />
                </footer>
            </div>
        </ModalProvider>
    )
}

/**
 * Input the hostname:port of the backend for a direct access.
 */
function renderDirectAccess(
    address: string,
    setAddress: React.Dispatch<React.SetStateAction<string>>,
    handleAddressClick: () => void,
    isAddressValid: boolean
) {
    return (
        <div className={Style.box}>
            <InputText
                label="Backend Address (ex: r1i4n35:5000)"
                value={address}
                onChange={setAddress}
                onEnterPressed={handleAddressClick}
            />
            <Button
                icon="plug"
                label="Connect to existing Backend"
                enabled={isAddressValid}
                onClick={handleAddressClick}
            />
            <HelpButton
                flat={true}
                label="How to allocate manually"
                topic="manual-allocation"
            />
        </div>
    )
}

/**
 * Input the account (proj3, proj42, ...) for an allocation through Unicore.
 */
function renderUnicoreAllocation(
    account: string,
    setAccount: (value: string) => void,
    setValidAccount: React.Dispatch<React.SetStateAction<boolean>>,
    handleAccountclick: () => void,
    validAccount: boolean
) {
    return (
        <div className={Style.box}>
            <InputText
                label="Account (ex: proj3, proj42, ...)"
                value={account}
                validator={RX_ACCOUNT_VALIDATOR}
                onChange={setAccount}
                onValidation={setValidAccount}
                onEnterPressed={handleAccountclick}
            />
            <Button
                icon="add"
                label="Allocate a node on BB5"
                enabled={validAccount}
                onClick={handleAccountclick}
            />
            <Button
                icon="help"
                flat={true}
                label="Check account access"
                href="https://groups.epfl.ch/cgi-bin/groups/listapp"
            />
        </div>
    )
}
