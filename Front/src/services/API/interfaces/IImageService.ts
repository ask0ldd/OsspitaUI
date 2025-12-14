import IGeneratedImage from "../../../interfaces/IGeneratedImage"
import { IImage } from "../../../interfaces/IImage"

export interface IImageService {
  /**
   * Uploads an image using a FormData object.
   * @param formData The form data containing the image file to upload.
   * @returns A promise that resolves to the uploaded image or undefined if upload fails.
   */
  upload(formData: FormData): Promise<IImage | undefined>

  /**
   * Retrieves all images.
   * @returns A promise that resolves to an array of images or undefined if request fails.
   */
  getAll(): Promise<IImage[] | undefined>

  /**
   * Fetches an image as Base64-encoded string by filename.
   * @param filename The name of the image to fetch.
   * @returns A promise that resolves to the Base64 string or undefined if request fails.
   */
  getImageAsBase64(filename: string): Promise<string | undefined>

  /**
   * Deletes an image by its ID.
   * @param imageId The numeric ID of the image to delete.
   * @returns A promise that resolves when deletion is complete or undefined if request fails.
   */
  deleteById(imageId: number): Promise<void | undefined>

  /**
   * Retrieves all generated images.
   * @returns A promise that resolves to an array of generated images or undefined if request fails.
   */
  getAllGeneratedImages(): Promise<IGeneratedImage[] | undefined>
}
