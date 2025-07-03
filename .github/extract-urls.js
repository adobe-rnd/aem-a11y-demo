/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import core from '@actions/core';
import github from '@actions/github';

try {
  const prBody = github.context.payload.pull_request?.body || '';
  const urlRegex = /https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9-]+--[a-zA-Z0-9-]+\.aem\.(?:live|page)[^\s<]*/g;
  const matches = [...new Set(prBody.match(urlRegex) || [])];

  const mainUrls = matches.filter((url) => url.includes('--main--'));
  const candidateUrls = matches.filter((url) => !url.includes('--main--'));

  const mainUrlMap = new Map(mainUrls.map((url) => {
    try {
      return [new URL(url).pathname, url];
    } catch (e) {
      console.warn(`Invalid baseline URL skipped: ${url}`);
      return [null, null];
    }
  }).filter((p) => p[0]));

  const urlPairs = candidateUrls.map((candidateUrl) => {
    try {
      const path = new URL(candidateUrl).pathname;
      return {
        candidate: candidateUrl,
        baseline: mainUrlMap.get(path) || '',
      };
    } catch (e) {
      console.warn(`Invalid candidate URL skipped: ${candidateUrl}`);
      return null;
    }
  }).filter((p) => p);

  console.log('URL Pairs:', JSON.stringify(urlPairs, null, 2));
  core.setOutput('url_pairs', JSON.stringify(urlPairs));
  core.setOutput('has_pairs', urlPairs.length > 0);
} catch (error) {
  core.setFailed(error.message);
} 