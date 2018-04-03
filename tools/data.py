import cv2 as cv
cv2 =cv
import numpy as np
import random
import json
import sys

def show(im):
    cv.imshow('image',im)
    cv.waitKey(0)
    cv.destroyAllWindows()

A = json.loads(open("out.json",'r').read())

W = 256
cnt = 0

for s in A[cnt:]:
    c = s['coord']
    im0 = cv2.resize(cv2.imread(s['file'])[c[1]:c[3],c[0]:c[2]],(W,W))
    im1 = im0.copy()
    im1[:] = [255,255,255]
    for l in s['lines']:
        for i in range(1,len(l)):
            p0 = (int(l[i-1][0]*W),int(l[i-1][1]*W))
            p1 = (int(l[i][0]*W),int(l[i][1]*W))
            cv2.line(im1,p0,p1,(0,0,0),2)

    im = np.hstack((im0,im1))
    cnt += 1
    cv.imwrite("dataset/"+str(cnt).zfill(5)+".png",im)
    print "processed #", cnt



