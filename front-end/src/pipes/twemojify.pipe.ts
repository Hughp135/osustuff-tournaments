import { Pipe, PipeTransform } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import twemoji from 'twemoji';

@Pipe({ name: 'twemojify' })
export class TwemojifyPipe implements PipeTransform {
  constructor(private _domSanitizer: DomSanitizer) { }
  transform(value: string): string {
    const result = twemoji.parse(value, { folder: 'svg', ext: '.svg' });

    return this._domSanitizer.sanitize(
      SecurityContext.HTML,
      this._domSanitizer.bypassSecurityTrustHtml(result),
    );
  }
}
