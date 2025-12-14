/* eslint-disable @typescript-eslint/no-unused-vars */
import { read, write, utils } from "xlsx";

/**
 * Service for parsing XLSX files and managing web search summarization status.
 */
class XLSXService{

    /**
     * Parses an XLSX file (as ArrayBuffer) and returns its contents as a JSON string.
     * @param {ArrayBuffer} data - The XLSX file data.
     * @returns {string} The sheet data as a JSON string (array of arrays).
     */
    parseToString(data : ArrayBuffer /*File | Blob | MediaSource, options : ParsingOptions*/) : string{
        const workbook = read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        return JSON.stringify(utils.sheet_to_json(sheet, {header: 1}))
    }

}

export default XLSXService