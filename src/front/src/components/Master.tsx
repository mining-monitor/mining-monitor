import * as React from "react"
import { Container } from "react-bootstrap"

export const Master = (props: React.PropsWithChildren) => {
    return (
        <Container fluid="xxl" className="my-3">
            {props.children}
        </Container>
    )
}

