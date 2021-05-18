import React from 'react'
import { Container } from 'react-bootstrap'

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=463a487aeff54f48bc6a88eea08f220e&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state`
const leftMargin = "<<< "
const rightMargin = " >>>"

export default function Login() {
    return (
        <>
            <Container
                className="d-flex align-items-end justify-content-center bg-dark"
                style={{ minHeight: '80vh' }}
            >
                <div className="text-white">
                    <h1>{leftMargin}welcome to music central{rightMargin}</h1>
                </div>
            </Container>
            <Container
                className="d-flex align-items-center justify-content-center bg-dark"
                style={{ minHeight: '20vh' }}
            >
                <div>
                    <a className="btn btn-success btn-lg" href={AUTH_URL}>
                        Login With Spotify
                    </a>
                </div>
            </Container>
        </>
    )
}
