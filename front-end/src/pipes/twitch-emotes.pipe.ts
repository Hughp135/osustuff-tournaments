import { Pipe, PipeTransform } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { globalEmotes } from './twitch-emotes';

@Pipe({ name: 'twitchEmotes' })
export class TwitchEmotesPipe implements PipeTransform {
  constructor(private _domSanitizer: DomSanitizer) {}
  transform(value: string): string {
    const result = value
      .split(' ')
      .map(word => {
        if (globalEmotes[word]) {
          return `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${globalEmotes[word].id}/1.0" />`;
        }

        return word;
      })
      .join(' ');

    return this._domSanitizer.sanitize(
      SecurityContext.HTML,
      this._domSanitizer.bypassSecurityTrustHtml(result),
    );
  }
}
