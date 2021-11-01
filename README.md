# Introduction

This repository is meant to showcase my talents as a back-end engineer to potential employers. It is programmed entirely in [Node.js][1] with [Travis-CI][2] for CI and [Docker][3] as its IAC.

[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE.md)
[![Build Status](https://img.shields.io/travis/wotsyula/nodejs-observer-sample)](https://app.travis-ci.com/github/wotsyula/nodejs-observer-sample)
[![Coveralls](https://img.shields.io/coveralls/github/wotsyula/nodejs-observer-sample)](https://coveralls.io/github/wotsyula/nodejs-observer-sample)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Table of Contents

1. [Problem statement](#problem-statement)
2. [Methodology](#methodology)
3. [Build](#build)
    - [Prequesites](#prequesites)
    - [Local Development Environment](#local-development-environment)
    - [Environment Variables](#environment-variables)
    - [Docker](#docker)
4. [Deploy](#deploy)
    - [As Kubernetes Pod](#as-kubernetes-pod)
    - [As Docker Service](#as-docker-service)
5. [FAQ](#faq)

# Problem Statement

To create a HTTTP notification system. A server (or set of servers) will keep track of `topics -> subscribers` where a topic is a string and a subscriber is an HTTP endpoint. When a message is published on a topic, it should be forwarded to all subscriber endpoints.

![image](https://user-images.githubusercontent.com/17839825/138559445-cbd0959f-a235-40ba-9f09-45b8e429d2b3.png)

# Methodology

To see my thought process and all design decisions made, please check out the [original proposal](https://github.com/wotsyula/nodejs-observer-sample/wiki/Q4-Sprint-1:-Proposal)

# Build

### Prequesites

- [Homebrew](https://brew.sh/) or [APT](https://en.wikipedia.org/wiki/APT_(software))
- [NVM](https://github.com/nvm-sh/nvm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/docs/setup/setup-overview)

### Local Development Environment

TODO

### Environment Variables

| NAME                 	| TYPE 	| Default           	| Description
|:--------------------:	|:----:	|:--------------------:	|:-----------------
| DB_URI               	| STR  	| -                    	| Database URI connection string
| BATCH_MAX_PUBLISH    	| NUM  	| 10                    | Number of jobs a worker node can handle at a given time
| PUBLISH_ATTEMPTS     	| NUM  	| 10                   	| Number of times to try to publish before giving up
| SERVER_HOST          	| STR  	| localhost            	| Host to bind to
| SERVER_PORT          	| NUM  	| 3000                 	| Port to bind to

### Docker

TODO

# Deploy

### As Kubernetes Pod

TODO

### As Docker Service

TODO

# FAQ

Nothing to see here

[1]: https://nodejs.org/en/
[2]: https://travis-ci.org/
[3]: https://www.docker.com/
