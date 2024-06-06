import axios from "axios";
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");
const { execSync } = require("child_process");

// Replace with your OpenAI API key
let apiKey = "";
let ffmpegPath = path.join(__dirname, "../../resources/ffmpeg/bin/ffmpeg.exe");
let sequenceNumber = 1;
export function inital(key) {
  if (process.platform === "linux") {
    ffmpegPath = "ffmpeg";
  }
  apiKey = key;
}

export async function getTranscription(audioFiles, partions) {
  const srtFilePath = path.resolve(
    path.dirname(__dirname),
    `${audioFiles[0].split(".")[0]}.srt`
  );
  // console.log("Transcribing audio files...");
  const requests = [];

  for (const file of audioFiles) {
    // Prepare the form data
    const formData = new FormData();
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    // Path to your audio file
    const audioFilePath = path.join(path.dirname(__dirname), `../${file}`);
    // Read the audio file
    const audioFile = fs.createReadStream(audioFilePath);
    formData.append("file", audioFile);
    requests.push(
      axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...formData.getHeaders(),
        },
      })
    );
    // console.log(`Transcribing ${file}...`);
  }
  // console.log("Waiting for responses...");
  const responses = await Promise.all(requests);

  // console.log("Writing transcription to file...");
  for (let i = 0; i < responses.length; i++) {
    // console.log(responses[i].data.duration);
    const transcriptionData = responses[i].data;
    // Convert the transcription data to SRT format
    const srtContent = convertToSRT(transcriptionData, partions[i]);

    // Write the SRT content to a file
    fs.appendFileSync(srtFilePath, srtContent, "utf-8");
  }
  // console.log("Transcription complete!");
  return srtFilePath;
}

// Helper function to convert transcription data to SRT format
function convertToSRT(data, partion) {
  let srt = "";
  data.segments.forEach((segment) => {
    const startTime = formatTime(convertToSeconds(partion) + segment.start);
    const endTime = formatTime(convertToSeconds(partion) + segment.end);
    const text = segment.text.trim();

    srt += `${sequenceNumber}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${text}\n\n`;

    sequenceNumber++;
  });

  return srt;
}

// Helper function to format time in SRT format (HH:MM:SS,MS)
function formatTime(seconds) {
  const date = new Date(0);
  date.setMilliseconds(seconds * 1000);
  const time = date.toISOString().slice(11, -1).replace(".", ",");

  // Ensure that milliseconds are three digits
  return time.length === 11 ? `${time}0` : time;
}

function convertToSeconds(time) {
  const [hours, minutes, seconds] = time.split(":");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}

export function splitAudioFromVideo(videoFile) {
  const fileName = path.basename(videoFile).split(".")[0];
  execSync(
    `${ffmpegPath} -i "${videoFile}" -vn -acodec libmp3lame "${fileName}.mp3"`
  );
  return `${fileName}.mp3`;
}

export function optimizeAudio(audioFile, partions) {
  const oggFile = `${audioFile.split(".")[0]}`;
  execSync(
    `${ffmpegPath} -i "${audioFile}" -vn -map_metadata -1 -ac 1 -c:a libopus -b:a 12k -application voip "${oggFile}.ogg"`
  );

  const audioFiles = [];
  if (partions.length !== 0) {
    for (let i = 0; i < partions.length; i++) {
      audioFiles.push(`${oggFile}${i}.ogg`);
      if (i === partions.length - 1) {
        execSync(
          `${ffmpegPath} -i "${oggFile}.ogg" -ss ${partions[i]} -c copy "${oggFile}${i}.ogg"`
        );
        break;
      }
      execSync(
        `${ffmpegPath} -i "${oggFile}.ogg" -ss ${partions[i]} -to ${
          partions[i + 1]
        } -c copy "${oggFile}${i}.ogg"`
      );
    }
  } else {
    audioFiles.push(`${oggFile}.ogg`);
  }
  return audioFiles;
}

// Call the splitAudioFromVideo function
// splitAudioFromVideo("video.mp4");
// optimizeAudio("video.mp3", ["00:00:00", "00:02:05", "00:07:16"]);
// getTranscription(
//   ["video0.ogg", "video1.ogg", "video2.ogg"],
//   ["00:00:00", "00:02:05", "00:07:16"]
// );

module.exports = {
  inital,
  getTranscription,
  splitAudioFromVideo,
  optimizeAudio,
};
