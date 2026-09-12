CREATE POLICY "read assignment files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assignments');
CREATE POLICY "teacher uploads assignment files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "teacher updates own assignment files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "teacher deletes own assignment files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "read submission files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'submissions');
CREATE POLICY "student uploads submission files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "student updates own submission files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "student deletes own submission files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text);