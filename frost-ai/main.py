import uvicorn

from app.config import environments


def main():
    uvicorn.run("app.server:app", host="0.0.0.0", port=environments.port)


if __name__ == "__main__":
    main()
