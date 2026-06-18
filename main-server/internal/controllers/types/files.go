package types

import "github.com/danielgtaylor/huma/v2"

type UploadFileInput struct {
	RawBody huma.MultipartFormFiles[struct {
		Image huma.FormFile `form:"image" doc:"The image file to upload"`
	}]
}

type UploadFileOutput struct {
	Body struct {
		Url string `json:"url"`
	}
}
