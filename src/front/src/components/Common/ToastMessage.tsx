import * as React from "react"
import { ToastContainer, Toast } from "react-bootstrap"

export interface Message {
    head: string,
    text: string,
}

interface MessageProps {
    message: Message,
}

export const ToastMessage = (props: MessageProps) => {
    const [show, setShow] = React.useState(false)

    React.useEffect(() => {
        if (props.message.head && props.message.text) {
            setTimeout(() => setShow(true), 200)
        }

        return () => setShow(false)
    }, [props.message])
    
    const handleClose = () => setShow(false)

    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
            <Toast onClose={handleClose} show={show} delay={10000} autohide>
                <Toast.Header>
                    <strong className="me-auto">{props.message.head}</strong>
                </Toast.Header>
                <Toast.Body>{props.message.text}</Toast.Body>
            </Toast>
        </ToastContainer>
    )
}