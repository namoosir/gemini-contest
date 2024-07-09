import React, { useMemo } from "react";
import { DropzoneOptions } from "react-dropzone";
import { Document, Thumbnail } from "react-pdf";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

import { cn } from "@/lib/utils";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/file-uploader";
import { CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";

interface Props {
  resumeURL: string | null;
  files: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  selectedResume: "existing" | "new" | null;
  setSelectedResume: React.Dispatch<
    React.SetStateAction<"existing" | "new" | null>
  >;
}

const ResumeCard: React.FC<Props> = (props) => {
  const dropzone: DropzoneOptions = {
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 1 * 1024 * 1024,
  };

  const fileURLs = useMemo(
    () => props.files?.map((file) => URL.createObjectURL(file)),
    [props.files]
  );

  const loader = (
    <div className="flex h-[240px] w-[512px] justify-center items-center">
      <Icon
        className="h-12 w-12 animate-spin text-muted-foreground"
        path={mdiLoading}
      />
    </div>
  );

  return (
    <div className="w-full h-full">
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>
          Please select or upload a relevant resume.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <div
          className={cn(
            "flex flex-col gap-2 flex-1 rounded-md",
            props.selectedResume === "new"
              ? "outline-none ring-offset-background ring-ring ring-offset-2 ring-2"
              : ""
          )}
        >
          {props.files?.length === 0 && (
            <FileUploader
              value={props.files}
              onValueChange={(e) => {
                if (e?.length !== 0) {
                  props.setSelectedResume("new");
                }
                props.setFiles(e);
              }}
              dropzoneOptions={dropzone}
            >
              <FileInput>
                <div className="flex items-center justify-center h-[268px] w-full bg-background rounded-md">
                  <p className="text-muted-foreground">Drop resume here</p>
                </div>
              </FileInput>
            </FileUploader>
          )}

          {props.files?.length !== 0 && (
            <FileUploader
              value={props.files}
              onValueChange={(e) => {
                if (e?.length !== 0) {
                  props.setSelectedResume("new");
                }
                props.setFiles(e);
              }}
              dropzoneOptions={dropzone}
              onClick={() => props.setSelectedResume("new")}
            >
              <FileUploaderContent className="flex items-center flex-row gap-2 px-0">
                {fileURLs?.map((file, i) => (
                  <FileUploaderItem
                    key={file}
                    index={i}
                    className={cn("h-[268px] p-0 rounded-md overflow-auto")}
                  >
                    <Document
                      loading={loader}
                      onItemClick={() => {
                        return;
                      }}
                      className="z-[0] size-full"
                      file={file}
                    >
                      <Thumbnail width={512} pageNumber={1} />
                    </Document>
                  </FileUploaderItem>
                ))}
              </FileUploaderContent>
            </FileUploader>
          )}
        </div>

        {/* EXISTING RESUME */}
        <div
          className={cn(
            "h-[268px] p-0 rounded-md overflow-auto flex-1",
            props.selectedResume === "existing"
              ? "outline-none ring-offset-background ring-ring ring-offset-2 ring-2"
              : ""
          )}
        >
          {props.resumeURL && (
            <Document
              loading={loader}
              className="z-[0] size-full"
              file={props.resumeURL}
              onItemClick={() => props.setSelectedResume("existing")}
            >
              <Thumbnail width={512} pageNumber={1} />
            </Document>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default ResumeCard;
