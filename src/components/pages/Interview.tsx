import React, { useEffect, useState } from "react";
import { mdiArrowRight, mdiArrowLeft, mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import { Page, pdfjs } from "react-pdf";

import {
  getUserResumes,
  getResumeObject,
  Resume,
} from "@/services/firebase/resumeService";
import useAuthContext from "@/hooks/useAuthContext";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import Steps from "../Steps";
import JobDescriptionCard from "../JobDescriptionCard";
import ResumeCard from "../ResumeCard";
import InterviewSettingsCard from "../InterviewSettingsCard";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type Page = 0 | 1 | 2;

const Interview: React.FC = () => {
  const { storage, db } = useFirebaseContext();
  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState<Page>(0);
  const [jobDescription, setJobDescription] = useState<string | undefined>(
    undefined
  );

  const [files, setFiles] = useState<File[] | null>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeURL, setResumeURL] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<
    "existing" | "new" | null
  >(null);

  useEffect(() => {
    const getResume = async () => {
      if (!user) return;

      const resumes = await getUserResumes(db, user?.uid);

      if (!resumes || resumes.length === 0) return;

      return setResume(resumes[0]);
    };

    // TODO: find better way to do this
    void getResume();
  }, [db, user]);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!resume) return;

      const url = await getResumeObject(storage, resume.url); // Assuming gcsUrl is the direct HTTP link to the PDF file

      setResumeURL(url);
    };

    void fetchPDF();
  }, [resume, storage]);

  useEffect(() => {
    if (files?.length === 0 && resumeURL) {
      setSelectedResume('existing');
    }
  }, [files]);

  useEffect(() => {
    if (resumeURL) {
      setSelectedResume('existing');
    }
  }, [resumeURL]);

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
        return (
          <JobDescriptionCard
            text={jobDescription}
            setText={setJobDescription}
          />
        );
      case 1:
        return (
          <ResumeCard
            resumeURL={resumeURL}
            files={files}
            setFiles={setFiles}
            selectedResume={selectedResume}
            setSelectedResume={setSelectedResume}
          />
        );
      case 2:
        return <InterviewSettingsCard />;
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
          { renderPage() }
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

export default Interview;
