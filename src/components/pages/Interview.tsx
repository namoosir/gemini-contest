import React, { useEffect, useMemo, useState } from "react";
import { mdiArrowRight, mdiArrowLeft, mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { DropzoneOptions } from "react-dropzone";
import { Document, Page, pdfjs, Thumbnail } from "react-pdf";

import {
  getUserResumes,
  getResumeObject,
  Resume,
} from "@/services/firebase/resumeService";
import useAuthContext from "@/hooks/useAuthContext";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import Steps from "../Steps";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/file-uploader";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
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

  const handleFinish = () => {
    // todo
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
      <div className="w-[1120px]">
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
                  onClick={handleFinish}
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
        <Textarea className="h-60" placeholder="Paste here..." />
      </CardContent>
    </div>
  );
};

const ResumeCard: React.FC = () => {
  const { storage, db } = useFirebaseContext();
  const { user } = useAuthContext();

  const [files, setFiles] = useState<File[] | null>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeURL, setResumeURL] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<0 | 1 | null>(null);

  const dropzone: DropzoneOptions = {
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 1 * 1024 * 1024,
  };

  useEffect(() => {
    const getResume = async () => {
      if (!user) return;

      const resumes = await getUserResumes(db, user?.uid);

      if (!resumes || resumes.length === 0) return;

      return setResume(resumes[0]);
    };

    // TODO: find better way to do this
    void(getResume());
  }, [db, user]);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!resume) return;

      const url = await getResumeObject(storage, resume.url); // Assuming gcsUrl is the direct HTTP link to the PDF file

      setResumeURL(url);
    };

    void(fetchPDF());
    console.log(resume);
  }, [resume, storage]);

  useEffect(() => {
    if (files?.length === 0) {
      setSelectedResume(1)
    }
  }, [files])

  useEffect(() => {
    if (resumeURL) {
      setSelectedResume(1)
    }
  }, [resumeURL])

  const fileURLs = useMemo(() => files?.map(file => URL.createObjectURL(file)), [files]);

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <p className="text-base text-muted-foreground">
          Please select or upload a relevant resume.
        </p>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <div
          className={cn("flex flex-col gap-2 flex-1 rounded-md", selectedResume === 0 ? 'outline-none ring-offset-background ring-ring ring-offset-4 ring-4' : '')}
        >
          {files?.length === 0 && (
            <FileUploader
              value={files}
              onValueChange={(e) => { 
                if (e?.length !== 0) {
                  setSelectedResume(0)
                }
                setFiles(e)
              }}
              dropzoneOptions={dropzone}
            >
              <FileInput>
                <div className="flex items-center justify-center h-60 w-full bg-background rounded-md">
                  <p className="text-muted-foreground">Drop resume here</p>
                </div>
              </FileInput>
            </FileUploader>
          )}

          {files?.length !== 0 && (
            <FileUploader
              value={files}
              onValueChange={(e) => { 
                if (e?.length !== 0) {
                  setSelectedResume(0)
                }
                setFiles(e)
              }}
              dropzoneOptions={dropzone}
              onClick={() => setSelectedResume(0)}
            >
              <FileUploaderContent className="flex items-center flex-row gap-2 px-0">
                {fileURLs?.map((file, i) => (
                  <FileUploaderItem
                    key={file}
                    index={i}
                    className={cn("h-60 p-0 rounded-md overflow-auto")}
                  >
                    <Document
                      onItemClick={() => {return}}
                      className="z-[0] size-full"
                      file={file}
                    >
                      <Thumbnail
                        width={512}
                        pageNumber={1}
                      />
                    </Document>
                  </FileUploaderItem>
                ))}
              </FileUploaderContent>
            </FileUploader>
          )}
        </div>

        {/* EXISTING RESUME */}
          <div
            className={cn("h-60 p-0 rounded-md overflow-auto flex-1", selectedResume === 1 ? 'outline-none ring-offset-background ring-ring ring-offset-4 ring-4' : '')}
          >
            {resume && (
              <Document
                className="z-[0] size-full"
                file={resumeURL}
                onItemClick={() => setSelectedResume(1)}
              >
                <Thumbnail
                  width={512}
                  pageNumber={1}
                />
              </Document>
            )}
          </div>
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
