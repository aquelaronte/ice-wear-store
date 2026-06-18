package controllers

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"arias.systems.ice-wear-store/main-server/config"
	"arias.systems.ice-wear-store/main-server/internal/controllers/types"
	"github.com/danielgtaylor/huma/v2"
)

func UploadFile(ctx context.Context, input *types.UploadFileInput) (*types.UploadFileOutput, error) {
	formData := input.RawBody.Data()
	fileUploaded := formData.Image

	if !fileUploaded.IsSet {
		return nil, huma.Error400BadRequest("No file uploaded in 'image' field")
	}

	ext := filepath.Ext(fileUploaded.Filename)
	newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	dstPath := filepath.Join(config.Envs.UploadDir, newFileName)

	dst, err := os.Create(dstPath)
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to create local destination file", err)
	}

	defer dst.Close()

	// Stream file data to disk
	if _, err := io.Copy(dst, fileUploaded); err != nil {
		return nil, huma.Error500InternalServerError("Failed to save image bytes to disk", err)
	}

	imageUrl := fmt.Sprintf("http://localhost:8000/images/%s", newFileName)

	response := &types.UploadFileOutput{}
	response.Body.Url = imageUrl

	return response, nil
}
