import to from "await-to-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function usePrediction() {
    const [generation, setGeneration] = useState<any>(null);
    const [prediction, setPrediction] = useState<any>(null);
    const [generatedList, setGeneratedList] = useState<any[]>([]);
    const [error, setError] = useState<any>(null);

    // useEffect(() => {
    //   console.log("-----------------------------------------")
    //   console.log("prediction:", prediction)
    //   console.log("error:", error)
    //   console.log("-----------------------------------------")
    // }, [prediction, error])

    function resetState() {
        setPrediction(null);
        setGeneration(null);
        setGeneratedList([]);
    }

    const handleSubmit = async (params: any) => {
        resetState();
        const [err, response1] = await to(
            fetch("/api/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...params,
                }),
            })
        );

        if (err) {
            console.error("fetch predictions error", err.message);
            toast.error(err.message);
            return Promise.reject({ message: err.message });
        }
        const responsePayload = await response1.json();
        let prediction = responsePayload?.prediction ?? responsePayload;

        if (!prediction || typeof prediction !== "object") {
            const message = "Invalid prediction response";
            toast.error(message);
            return Promise.reject({ message });
        }

        const pid = prediction.dataId || prediction.id;

        if (response1.status !== 201) {
            const detail = prediction.detail || prediction.error || "Failed to generate image";
            toast.error(detail);
            setError(detail);
            return Promise.reject({ message: detail });
        }

        setPrediction(prediction);

        if (prediction.status === "succeeded" && prediction.output) {
            const imageUrl = typeof prediction.output === "string" ? prediction.output : prediction?.output?.[0];
            if (imageUrl) {
                setGeneration({ url: imageUrl });
                return Promise.resolve(imageUrl);
            }
        }

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            if (!prediction.id) {
                break;
            }
            await sleep(5000);
            const response2 = await fetch(
                "/api/predictions/" + prediction.id + `?pid=${pid ?? ""}`,
                { cache: "no-store" }
            );
            prediction = await response2.json();
            if (response2.status !== 200) {
                const detail = prediction.detail || prediction.error || "Failed to fetch prediction";
                toast.error(detail);
                setError(detail);
                return Promise.reject({ message: detail });
            }
            // console.log({ prediction });
            console.log("loading...");

            if (prediction.output) {
                const imageUrl = typeof prediction.output === "string" ? prediction.output : prediction?.output?.[0];
                if (imageUrl) {
                    setGeneration({ url: imageUrl });
                    return Promise.resolve(imageUrl);
                }
            }
            setPrediction(prediction);
        }

        // --------- mock start ---------
        // await sleep(2000);
        // const prediction = {
        //   output: ["https://replicate.delivery/pbxt/yQkczwuNdb5fZ6P5MBb6ujhkZwgaefDGEAmYHDEse20T8z4MB/R8_LivePortrait_00001.mp4"],
        // };

        // setPrediction({
        //   output: prediction?.output,
        // });
        // setGeneratedList([prediction?.output[0], ...generatedList])
        // console.info("handleStorage", prediction?.output[0])
        // --------- mock end ---------
    };

    return {
        prediction,
        error,
        generatedList,
        setGeneratedList,
        generation,
        handleSubmit,
    };
}
