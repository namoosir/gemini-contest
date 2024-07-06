import React, { useEffect, useRef, useState } from "react";
import { mdiArrowRight, mdiArrowLeft, mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { DropzoneOptions } from "react-dropzone";
import { Document, Page, pdfjs, Thumbnail } from 'react-pdf';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import ComboBox from "../ComboBox";
import Steps from "../Steps";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/file-uploader";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type Page = 0 | 1 | 2;

const Interview: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(0);

  const handleNextPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage + 1) as Page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage: Page): Page => (prevPage - 1) as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return <JobDescriptionCard />;
      case 1:
        return <ResumeCard />;
      case 2:
        return <InterviewCard />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col py-12 items-center">
      <div className="max-w-[700px] min-w-[700px]">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-4">
          Interview
        </h3>
        <Card>
          <CardHeader>
            <Steps currentStep={currentPage} />
          </CardHeader>
          {renderPage()}
          <CardFooter>
            <div className="flex w-full justify-between items-center">
              <Button
                disabled={currentPage < 1}
                variant="secondary"
                onClick={handlePreviousPage}
              >
                <Icon className="h4 w-4 mr-2" path={mdiArrowLeft} />
                Previous
              </Button>

              {currentPage < 2 && (
                <Button
                  className="ml-auto"
                  variant="default"
                  onClick={handleNextPage}
                >
                  Next
                  <Icon className="h4 w-4 ml-2" path={mdiArrowRight} />
                </Button>
              )}

              {currentPage === 2 && (
                <Button
                  className="ml-auto"
                  variant="default"
                  onClick={handleNextPage}
                >
                  Start
                  <Icon className="h4 w-4 ml-2" path={mdiCheck} />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const JobDescriptionCard: React.FC = () => {
  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <p className="text-base text-muted-foreground">
          Please enter the job description you would like to simulate an
          interview for.
        </p>
      </CardHeader>
      <CardContent>
        <Textarea placeholder="Paste here..." />
      </CardContent>
    </div>
  );
};

const ResumeCard: React.FC = () => {
  const [files, setFiles] = useState<File[] | null>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);  
  const containerRef = useRef<HTMLElement | null>(null);

  const tempItems = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ];
  const dropzone = {
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 1 * 1024 * 1024 * 1024,
  } satisfies DropzoneOptions;

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
  }, [containerRef.current]);

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <p className="text-base text-muted-foreground">
          Please select or upload a relevant resume.
        </p>
      </CardHeader>
      
      <CardContent className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 w-1/2">
          <ComboBox
            width={325}
            items={tempItems}
            name={"Resume"}
          />
          <FileUploader
            value={files}
            onValueChange={setFiles}
            dropzoneOptions={dropzone}
          >
            <FileInput>
              <div className="flex items-center justify-center h-32 w-full border bg-background rounded-md">
                <p className="text-gray-400">Drop resume here</p>
              </div>
            </FileInput>
          </FileUploader>
        </div>
        <FileUploader
          className="flex w-full flex-1"
          value={files}
          onValueChange={setFiles}
          dropzoneOptions={dropzone}
        >
          <FileUploaderContent
            // @ts-expect-error ref type is not matching
            ref={containerRef}
            className="flex items-center flex-row gap-2"
          >
            {files?.map((file, i) => (
              <FileUploaderItem
                key={i}
                index={i}
                className="size-full p-0 rounded-md overflow-hidden"
                aria-roledescription={`file ${i + 1} containing ${
                  file.name
                }`}
              >
                  <Document className="z-[0] size-full" file={URL.createObjectURL(file)}>
                    <Thumbnail width={containerWidth} pageNumber={1} />
                  </Document>
              </FileUploaderItem>
            ))}
          </FileUploaderContent>
        </FileUploader>
      </CardContent>
    </div>
  );
};

const InterviewCard: React.FC = () => {
  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Interview</CardTitle>
      </CardHeader>
      <CardContent>{/* Add your interview content here */}</CardContent>
    </div>
  );
};

export default Interview;
