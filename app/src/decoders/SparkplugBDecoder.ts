import { Base64Message } from '../../../backend/src/Model/Base64Message'
import { Decoder } from '../../../backend/src/Model/Decoder'
import { get } from 'sparkplug-payload'
import { MessageDecoder } from './MessageDecoder'
var sparkplug = get('spBv1.0')

export const SparkplugDecoder: MessageDecoder = {
  formats: ['Sparkplug'],
  canDecodeTopic(topic: string) {
    return !!topic.match(/^spBv1\.0\/[^/]+\/[ND](DATA|CMD|DEATH|BIRTH)\/[^/]+(\/[^/]+)?$/u)
  },
  decode(input) {
    try {
      // @ts-ignore
      const data = sparkplug.decodePayload(new Uint8Array(input.toBuffer()));

      // For every value (including nested), see if it's a Long and run
      // .toString() on it


      // @ts-ignore
      data.unixTimestamp = data.timestamp.toString();
      // @ts-ignore
      data.timestamp = new Date(Number.parseInt(data.unixTimestamp));
      // @ts-ignore
      data.metrics.forEach((metric) => {
        // @ts-ignore
        metric.unixTimestamp = metric.timestamp.toString();
        // @ts-ignore
        metric.timestamp = new Date(Number.parseInt(metric.unixTimestamp));
        // @ts-ignore
        metric.alias = metric.alias.toString();
      });
      // @ts-ignore
      data.seq = data.seq.toString();

      console.log(data);

      const message = Base64Message.fromString(
        JSON.stringify(
          // @ts-ignore
          data
        )
      )
      return { message, decoder: Decoder.SPARKPLUG }
    } catch {
      return {
        error: 'Failed to decode sparkplugb payload',
        decoder: Decoder.NONE,
      }
    }
  },
}
