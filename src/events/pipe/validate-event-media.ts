// schedules/pipes/validate-slots.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { HandleEventMediaDto } from '../dto/events-dto';

@Injectable()
export class ValidateEventMediaPipe implements PipeTransform {
  async transform(value: HandleEventMediaDto): Promise<HandleEventMediaDto> {
    // Validate that media is an array
    this.checkDuplicates(value.media);

    return value;
  }

  // validate URL if it actually exists
  protected async isValidUrl(url: string): Promise<boolean | undefined> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return (
        response.ok &&
        response.headers.get('content-type')?.startsWith('image/')
      );
    } catch (e) {
      return false;
    }
  }

  // Check for duplicate medias
  private checkDuplicates(urls: string[]) {
    const seen = new Set<string>();

    for (const url of urls) {
      const key = `${url}`;

      if (seen.has(key)) {
        throw new BadRequestException(
          `Media dupliqué détecté: ${url}. ` +
            'Veuillez supprimer les doublons et réessayer.',
        );
      }
      seen.add(key);
    }
  }
}

@Injectable()
export class ValidateEventMediaPipeCreation
  extends ValidateEventMediaPipe
  implements PipeTransform
{
  async transform(value: HandleEventMediaDto): Promise<HandleEventMediaDto> {
    await super.transform(value);

    // Validate each URL
    await Promise.all(
      value.media.map(async (url) => {
        const isValid = await super.isValidUrl(url);
        if (!isValid) {
          throw new BadRequestException(`URL invalide détecté: ${url}`);
        }
      }),
    );

    return value;
  }
}
